-- One row per user, auto created on sign up via trigger.
CREATE TABLE profiles (
    id            UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username      TEXT        UNIQUE NOT NULL,
    display_name  TEXT,
    avatar_url    TEXT,
    bio           TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- Global list of exercises (is_custom = false) plus any user created
-- exercises (is_custom = true, created_by = that user's profile id).
CREATE TABLE exercise_library (
    id             UUID     PRIMARY KEY DEFAULT gen_random_uuid(),
    name           TEXT     NOT NULL,
    muscle_groups  TEXT[]   NOT NULL DEFAULT '{}',
    equipment      TEXT     NOT NULL DEFAULT 'other'
                            CHECK (equipment IN (
                                'barbell', 'dumbbell', 'cable',
                                'machine', 'bodyweight', 'other'
                            )),
    category       TEXT     NOT NULL DEFAULT 'strength'
                            CHECK (category IN ('strength', 'cardio', 'flexibility')),
    is_custom      BOOLEAN  NOT NULL DEFAULT false,
    created_by     UUID     REFERENCES profiles(id) ON DELETE SET NULL,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (
        (is_custom = false AND created_by IS NULL) OR
        (is_custom = true  AND created_by IS NOT NULL)
    )
);

-- A single workout session (e.g. "Monday push day").
CREATE TABLE workouts (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title            TEXT        NOT NULL DEFAULT 'Workout',
    notes            TEXT,
    duration_minutes INTEGER,
    completed_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Each movement logged inside a workout. Either links to the global
-- library (library_id) or stores a free text name (custom_name).
-- Exactly one of the two must be set enforced by the CHECK below.
CREATE TABLE exercises (
    id           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_id   UUID    NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
    library_id   UUID    REFERENCES exercise_library(id) ON DELETE SET NULL,
    custom_name  TEXT,
    notes        TEXT,
    order_index  INTEGER NOT NULL DEFAULT 0,
    CHECK (
        (library_id IS NOT NULL AND custom_name IS NULL) OR
        (library_id IS NULL     AND custom_name IS NOT NULL)
    )
);

-- Individual sets within an exercise (reps, weight, or timed).
CREATE TABLE sets (
    id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    exercise_id      UUID          NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    set_index        INTEGER       NOT NULL DEFAULT 0,
    reps             INTEGER,
    weight_kg        DECIMAL(6,2),
    duration_seconds INTEGER,
    rpe              DECIMAL(3,1)  CHECK (rpe BETWEEN 1 AND 10)
);

CREATE TABLE friendships (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    addressee_id UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status       TEXT        NOT NULL DEFAULT 'pending'
                             CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (requester_id, addressee_id),
    CHECK (requester_id <> addressee_id)
);

CREATE TABLE workout_likes (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_id UUID        NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
    user_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (workout_id, user_id)
);

CREATE TABLE workout_comments (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_id UUID        NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
    user_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content    TEXT        NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_exercise_library_name      ON exercise_library(name);
CREATE INDEX idx_exercise_library_custom    ON exercise_library(is_custom, created_by);
CREATE INDEX idx_workouts_user_id           ON workouts(user_id);
CREATE INDEX idx_workouts_completed_at      ON workouts(completed_at DESC);
CREATE INDEX idx_exercises_workout_id       ON exercises(workout_id);
CREATE INDEX idx_exercises_library_id       ON exercises(library_id);
CREATE INDEX idx_sets_exercise_id           ON sets(exercise_id);
CREATE INDEX idx_friendships_requester      ON friendships(requester_id);
CREATE INDEX idx_friendships_addressee      ON friendships(addressee_id);
CREATE INDEX idx_workout_likes_workout      ON workout_likes(workout_id);
CREATE INDEX idx_workout_comments_workout   ON workout_comments(workout_id);


-- Helper Functions

-- Returns true if two users have an accepted friendship.
CREATE OR REPLACE FUNCTION are_friends(user_a UUID, user_b UUID)
RETURNS BOOLEAN
LANGUAGE SQL SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM friendships
        WHERE  status = 'accepted'
        AND    (
            (requester_id = user_a AND addressee_id = user_b)
            OR
            (requester_id = user_b AND addressee_id = user_a)
        )
    );
$$;

-- Auto updates updated_at on any table that has it.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


-- Triggers

-- Auto create a profile row whenever a user signs up.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.profiles (id, username, display_name)
    VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data->>'username',
            'user_' || LEFT(NEW.id::TEXT, 8)
        ),
        NEW.raw_user_meta_data->>'username'
    );
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER workout_comments_updated_at
    BEFORE UPDATE ON workout_comments
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Row Level Security
ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_library  ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises         ENABLE ROW LEVEL SECURITY;
ALTER TABLE sets              ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships       ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_likes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_comments  ENABLE ROW LEVEL SECURITY;

-- Profiles: anyone authenticated can read, only the owner can update.
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Exercise library: global exercises are readable by everyone;
-- custom exercises are only visible to their creator.
CREATE POLICY "library_select" ON exercise_library FOR SELECT
    USING (is_custom = false OR created_by = auth.uid());
CREATE POLICY "library_insert" ON exercise_library FOR INSERT
    WITH CHECK (is_custom = true AND created_by = auth.uid());
CREATE POLICY "library_update" ON exercise_library FOR UPDATE
    USING (is_custom = true AND created_by = auth.uid());
CREATE POLICY "library_delete" ON exercise_library FOR DELETE
    USING (is_custom = true AND created_by = auth.uid());

-- Workouts: visible to the owner + accepted friends; only owner can write.
CREATE POLICY "workouts_select" ON workouts FOR SELECT
    USING (user_id = auth.uid() OR are_friends(auth.uid(), user_id));
CREATE POLICY "workouts_insert" ON workouts FOR INSERT
    WITH CHECK (user_id = auth.uid());
CREATE POLICY "workouts_update" ON workouts FOR UPDATE
    USING (user_id = auth.uid());
CREATE POLICY "workouts_delete" ON workouts FOR DELETE
    USING (user_id = auth.uid());

-- Exercises & Sets: inherit workout visibility through the join.
CREATE POLICY "exercises_select" ON exercises FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM workouts w
        WHERE  w.id = workout_id
          AND  (w.user_id = auth.uid() OR are_friends(auth.uid(), w.user_id))
    ));

CREATE POLICY "exercises_write" ON exercises FOR ALL
    USING (EXISTS (
        SELECT 1 FROM workouts w
        WHERE  w.id = workout_id AND w.user_id = auth.uid()
    ));

CREATE POLICY "sets_select" ON sets FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM exercises e
        JOIN   workouts w ON w.id = e.workout_id
        WHERE  e.id = exercise_id
          AND  (w.user_id = auth.uid() OR are_friends(auth.uid(), w.user_id))
    ));
    
CREATE POLICY "sets_write" ON sets FOR ALL
    USING (EXISTS (
        SELECT 1 FROM exercises e
        JOIN   workouts w ON w.id = e.workout_id
        WHERE  e.id = exercise_id AND w.user_id = auth.uid()
    ));

-- Friendships: users can see/manage their own.
CREATE POLICY "friendships_select" ON friendships FOR SELECT
    USING (requester_id = auth.uid() OR addressee_id = auth.uid());
CREATE POLICY "friendships_insert" ON friendships FOR INSERT
    WITH CHECK (requester_id = auth.uid());
CREATE POLICY "friendships_update" ON friendships FOR UPDATE
    USING (addressee_id = auth.uid()); -- only the recipient can accept/reject
CREATE POLICY "friendships_delete" ON friendships FOR DELETE
    USING (requester_id = auth.uid() OR addressee_id = auth.uid());

-- Likes: friends can see and toggle.
CREATE POLICY "likes_select" ON workout_likes FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM workouts w
        WHERE  w.id = workout_id
          AND  (w.user_id = auth.uid() OR are_friends(auth.uid(), w.user_id))
    ));
CREATE POLICY "likes_insert" ON workout_likes FOR INSERT
    WITH CHECK (user_id = auth.uid());
CREATE POLICY "likes_delete" ON workout_likes FOR DELETE
    USING (user_id = auth.uid());

-- Comments: friends can read; owner can write/edit/delete their own.
CREATE POLICY "comments_select" ON workout_comments FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM workouts w
        WHERE  w.id = workout_id
          AND  (w.user_id = auth.uid() OR are_friends(auth.uid(), w.user_id))
    ));
CREATE POLICY "comments_insert" ON workout_comments FOR INSERT
    WITH CHECK (user_id = auth.uid());
CREATE POLICY "comments_update" ON workout_comments FOR UPDATE
    USING (user_id = auth.uid());
CREATE POLICY "comments_delete" ON workout_comments FOR DELETE
    USING (user_id = auth.uid());

-- Seed: Global Exercise Library
INSERT INTO exercise_library (name, muscle_groups, equipment, category) VALUES

-- ── Chest ────────────────────────────────────────────────────
('Barbell Bench Press',         ARRAY['chest','triceps','front_delts'],      'barbell',    'strength'),
('Incline Barbell Bench Press', ARRAY['chest','triceps','front_delts'],      'barbell',    'strength'),
('Decline Barbell Bench Press', ARRAY['chest','triceps'],                    'barbell',    'strength'),
('Dumbbell Bench Press',        ARRAY['chest','triceps','front_delts'],      'dumbbell',   'strength'),
('Incline Dumbbell Press',      ARRAY['chest','triceps','front_delts'],      'dumbbell',   'strength'),
('Dumbbell Chest Fly',          ARRAY['chest'],                              'dumbbell',   'strength'),
('Cable Crossover',             ARRAY['chest'],                              'cable',      'strength'),
('Push-Up',                     ARRAY['chest','triceps','front_delts'],      'bodyweight', 'strength'),
('Dips',                        ARRAY['chest','triceps'],                    'bodyweight', 'strength'),
('Pec Deck',                    ARRAY['chest'],                              'machine',    'strength'),

-- ── Back ─────────────────────────────────────────────────────
('Deadlift',                    ARRAY['back','glutes','hamstrings','traps'], 'barbell',    'strength'),
('Sumo Deadlift',               ARRAY['glutes','hamstrings','back','quads'], 'barbell',    'strength'),
('Barbell Row',                 ARRAY['back','biceps','lats'],               'barbell',    'strength'),
('Dumbbell Row',                ARRAY['back','biceps','lats'],               'dumbbell',   'strength'),
('Pull-Up',                     ARRAY['lats','biceps','back'],               'bodyweight', 'strength'),
('Chin-Up',                     ARRAY['lats','biceps'],                      'bodyweight', 'strength'),
('Lat Pulldown',                ARRAY['lats','biceps'],                      'cable',      'strength'),
('Cable Row',                   ARRAY['back','biceps'],                      'cable',      'strength'),
('T-Bar Row',                   ARRAY['back','biceps','lats'],               'barbell',    'strength'),
('Face Pull',                   ARRAY['rear_delts','traps','back'],          'cable',      'strength'),
('Good Morning',                ARRAY['hamstrings','glutes','back'],         'barbell',    'strength'),

-- ── Shoulders ────────────────────────────────────────────────
('Barbell Overhead Press',      ARRAY['shoulders','triceps'],                'barbell',    'strength'),
('Dumbbell Shoulder Press',     ARRAY['shoulders','triceps'],                'dumbbell',   'strength'),
('Arnold Press',                ARRAY['shoulders','triceps'],                'dumbbell',   'strength'),
('Lateral Raise',               ARRAY['side_delts'],                         'dumbbell',   'strength'),
('Cable Lateral Raise',         ARRAY['side_delts'],                         'cable',      'strength'),
('Front Raise',                 ARRAY['front_delts'],                        'dumbbell',   'strength'),
('Rear Delt Fly',               ARRAY['rear_delts'],                         'dumbbell',   'strength'),
('Upright Row',                 ARRAY['traps','side_delts'],                 'barbell',    'strength'),
('Shrugs',                      ARRAY['traps'],                              'barbell',    'strength'),

-- ── Legs — Quads & Glutes ────────────────────────────────────
('Squat',                       ARRAY['quads','glutes','hamstrings'],        'barbell',    'strength'),
('Front Squat',                 ARRAY['quads','glutes'],                     'barbell',    'strength'),
('Goblet Squat',                ARRAY['quads','glutes'],                     'dumbbell',   'strength'),
('Bulgarian Split Squat',       ARRAY['quads','glutes'],                     'dumbbell',   'strength'),
('Lunge',                       ARRAY['quads','glutes','hamstrings'],        'bodyweight', 'strength'),
('Walking Lunge',               ARRAY['quads','glutes','hamstrings'],        'dumbbell',   'strength'),
('Leg Press',                   ARRAY['quads','glutes','hamstrings'],        'machine',    'strength'),
('Hack Squat',                  ARRAY['quads','glutes'],                     'machine',    'strength'),
('Leg Extension',               ARRAY['quads'],                              'machine',    'strength'),
('Hip Thrust',                  ARRAY['glutes','hamstrings'],                'barbell',    'strength'),
('Glute Bridge',                ARRAY['glutes','hamstrings'],                'bodyweight', 'strength'),

-- ── Legs — Hamstrings & Calves ───────────────────────────────
('Romanian Deadlift',           ARRAY['hamstrings','glutes','back'],         'barbell',    'strength'),
('Leg Curl',                    ARRAY['hamstrings'],                         'machine',    'strength'),
('Nordic Curl',                 ARRAY['hamstrings'],                         'bodyweight', 'strength'),
('Standing Calf Raise',         ARRAY['calves'],                             'machine',    'strength'),
('Seated Calf Raise',           ARRAY['calves'],                             'machine',    'strength'),
('Donkey Calf Raise',           ARRAY['calves'],                             'bodyweight', 'strength'),

-- ── Biceps ───────────────────────────────────────────────────
('Barbell Curl',                ARRAY['biceps'],                             'barbell',    'strength'),
('Dumbbell Curl',               ARRAY['biceps'],                             'dumbbell',   'strength'),
('Hammer Curl',                 ARRAY['biceps','forearms'],                  'dumbbell',   'strength'),
('Preacher Curl',               ARRAY['biceps'],                             'barbell',    'strength'),
('Cable Curl',                  ARRAY['biceps'],                             'cable',      'strength'),
('Concentration Curl',          ARRAY['biceps'],                             'dumbbell',   'strength'),
('Incline Dumbbell Curl',       ARRAY['biceps'],                             'dumbbell',   'strength'),
('Reverse Curl',                ARRAY['biceps','forearms'],                  'barbell',    'strength'),

-- ── Triceps ──────────────────────────────────────────────────
('Tricep Pushdown',             ARRAY['triceps'],                            'cable',      'strength'),
('Skull Crusher',               ARRAY['triceps'],                            'barbell',    'strength'),
('Close-Grip Bench Press',      ARRAY['triceps','chest'],                    'barbell',    'strength'),
('Overhead Tricep Extension',   ARRAY['triceps'],                            'cable',      'strength'),
('Tricep Kickback',             ARRAY['triceps'],                            'dumbbell',   'strength'),
('Diamond Push-Up',             ARRAY['triceps','chest'],                    'bodyweight', 'strength'),

-- ── Core ─────────────────────────────────────────────────────
('Plank',                       ARRAY['core'],                               'bodyweight', 'strength'),
('Side Plank',                  ARRAY['core'],                               'bodyweight', 'strength'),
('Crunch',                      ARRAY['core'],                               'bodyweight', 'strength'),
('Hanging Leg Raise',           ARRAY['core','hip_flexors'],                 'bodyweight', 'strength'),
('Leg Raise',                   ARRAY['core','hip_flexors'],                 'bodyweight', 'strength'),
('Ab Wheel Rollout',            ARRAY['core'],                               'other',      'strength'),
('Russian Twist',               ARRAY['core'],                               'bodyweight', 'strength'),
('Cable Crunch',                ARRAY['core'],                               'cable',      'strength'),
('Dead Bug',                    ARRAY['core'],                               'bodyweight', 'strength'),
('Hollow Body Hold',            ARRAY['core'],                               'bodyweight', 'strength'),

-- ── Cardio ───────────────────────────────────────────────────
('Running',                     ARRAY['full_body'],                          'other',      'cardio'),
('Walking',                     ARRAY['full_body'],                          'other',      'cardio'),
('Cycling',                     ARRAY['quads','glutes','calves'],            'machine',    'cardio'),
('Rowing',                      ARRAY['back','legs','core'],                 'machine',    'cardio'),
('Jump Rope',                   ARRAY['calves','full_body'],                 'other',      'cardio'),
('Stair Climber',               ARRAY['quads','glutes','calves'],            'machine',    'cardio'),
('Elliptical',                  ARRAY['full_body'],                          'machine',    'cardio'),
('Swimming',                    ARRAY['full_body'],                          'other',      'cardio'),
('Battle Ropes',                ARRAY['shoulders','core','full_body'],       'other',      'cardio'),
('Box Jump',                    ARRAY['quads','glutes','calves'],            'bodyweight', 'cardio');
