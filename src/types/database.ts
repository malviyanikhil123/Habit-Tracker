/**
 * Database Types for Supabase
 * 
 * These types define the structure of your Supabase database tables.
 * They provide type safety when querying the database.
 * 
 * Tables:
 * - habits: Stores habit definitions for each user
 * - habit_logs: Stores daily completion status for each habit
 */

export interface Database {
    public: {
        Tables: {
            /**
             * Habits Table
             * Stores the habit definitions created by users
             */
            habits: {
                Row: {
                    id: string;           // UUID primary key
                    user_id: string;      // References auth.users(id)
                    title: string;        // Habit name/title
                    created_at: string;   // Timestamp of creation
                    updated_at: string;   // Timestamp of last update
                };
                Insert: {
                    id?: string;          // Optional - auto-generated if not provided
                    user_id: string;      // Required - current user's ID
                    title: string;        // Required - habit name
                    created_at?: string;  // Optional - defaults to now()
                    updated_at?: string;  // Optional - defaults to now()
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    title?: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            /**
             * Habit Logs Table
             * Stores daily completion records for habits
             */
            habit_logs: {
                Row: {
                    id: string;           // UUID primary key
                    habit_id: string;     // References habits(id)
                    log_date: string;     // Date of the log (YYYY-MM-DD)
                    status: boolean;      // Completion status (true = completed)
                    created_at: string;   // Timestamp of creation
                };
                Insert: {
                    id?: string;          // Optional - auto-generated
                    habit_id: string;     // Required - habit reference
                    log_date: string;     // Required - date
                    status: boolean;      // Required - completion status
                    created_at?: string;  // Optional - defaults to now()
                };
                Update: {
                    id?: string;
                    habit_id?: string;
                    log_date?: string;
                    status?: boolean;
                    created_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "habit_logs_habit_id_fkey";
                        columns: ["habit_id"];
                        referencedRelation: "habits";
                        referencedColumns: ["id"];
                    }
                ];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            [_ in never]: never;
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
}

// Convenience type aliases for easier usage
export type Habit = Database['public']['Tables']['habits']['Row'];
export type HabitInsert = Database['public']['Tables']['habits']['Insert'];
export type HabitUpdate = Database['public']['Tables']['habits']['Update'];

export type HabitLog = Database['public']['Tables']['habit_logs']['Row'];
export type HabitLogInsert = Database['public']['Tables']['habit_logs']['Insert'];
export type HabitLogUpdate = Database['public']['Tables']['habit_logs']['Update'];
