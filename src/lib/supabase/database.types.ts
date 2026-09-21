export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      adolescent_life_events: {
        Row: {
          adolescent_id: string
          body: string
          created_at: string
          created_by: string | null
          id: string
          occurred_on: string
        }
        Insert: {
          adolescent_id: string
          body: string
          created_at?: string
          created_by?: string | null
          id?: string
          occurred_on?: string
        }
        Update: {
          adolescent_id?: string
          body?: string
          created_at?: string
          created_by?: string | null
          id?: string
          occurred_on?: string
        }
        Relationships: [
          {
            foreignKeyName: "adolescent_life_events_adolescent_id_fkey"
            columns: ["adolescent_id"]
            isOneToOne: false
            referencedRelation: "adolescents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adolescent_life_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      adolescent_life_profiles: {
        Row: {
          academic_difficulties: string | null
          adolescent_id: string
          birth_place: string | null
          church_name: string | null
          district: string | null
          doctor_notes: string | null
          education_situation: string | null
          family_context: string | null
          father_name: string | null
          father_occupation: string | null
          guardian_consent: boolean
          health_conditions: string | null
          hobbies: string | null
          medications: string | null
          mother_name: string | null
          mother_occupation: string | null
          sibling_count: number | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          academic_difficulties?: string | null
          adolescent_id: string
          birth_place?: string | null
          church_name?: string | null
          district?: string | null
          doctor_notes?: string | null
          education_situation?: string | null
          family_context?: string | null
          father_name?: string | null
          father_occupation?: string | null
          guardian_consent?: boolean
          health_conditions?: string | null
          hobbies?: string | null
          medications?: string | null
          mother_name?: string | null
          mother_occupation?: string | null
          sibling_count?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          academic_difficulties?: string | null
          adolescent_id?: string
          birth_place?: string | null
          church_name?: string | null
          district?: string | null
          doctor_notes?: string | null
          education_situation?: string | null
          family_context?: string | null
          father_name?: string | null
          father_occupation?: string | null
          guardian_consent?: boolean
          health_conditions?: string | null
          hobbies?: string | null
          medications?: string | null
          mother_name?: string | null
          mother_occupation?: string | null
          sibling_count?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "adolescent_life_profiles_adolescent_id_fkey"
            columns: ["adolescent_id"]
            isOneToOne: true
            referencedRelation: "adolescents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adolescent_life_profiles_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      adolescent_agape_memberships: {
        Row: {
          adolescent_id: string
          agape_id: string
          created_at: string
          created_by: string | null
          ended_on: string | null
          id: string
          started_on: string
        }
        Insert: {
          adolescent_id: string
          agape_id: string
          created_at?: string
          created_by?: string | null
          ended_on?: string | null
          id?: string
          started_on?: string
        }
        Update: {
          adolescent_id?: string
          agape_id?: string
          created_at?: string
          created_by?: string | null
          ended_on?: string | null
          id?: string
          started_on?: string
        }
        Relationships: [
          {
            foreignKeyName: "adolescent_agape_memberships_adolescent_id_fkey"
            columns: ["adolescent_id"]
            isOneToOne: false
            referencedRelation: "adolescents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adolescent_agape_memberships_adolescent_id_fkey"
            columns: ["adolescent_id"]
            isOneToOne: false
            referencedRelation: "v_adolescents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adolescent_agape_memberships_agape_id_fkey"
            columns: ["agape_id"]
            isOneToOne: false
            referencedRelation: "agapes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adolescent_agape_memberships_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      adolescent_clan_memberships: {
        Row: {
          adolescent_id: string
          clan_id: string
          created_at: string
          created_by: string | null
          ended_on: string | null
          id: string
          started_on: string
        }
        Insert: {
          adolescent_id: string
          clan_id: string
          created_at?: string
          created_by?: string | null
          ended_on?: string | null
          id?: string
          started_on?: string
        }
        Update: {
          adolescent_id?: string
          clan_id?: string
          created_at?: string
          created_by?: string | null
          ended_on?: string | null
          id?: string
          started_on?: string
        }
        Relationships: [
          {
            foreignKeyName: "adolescent_clan_memberships_adolescent_id_fkey"
            columns: ["adolescent_id"]
            isOneToOne: false
            referencedRelation: "adolescents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adolescent_clan_memberships_adolescent_id_fkey"
            columns: ["adolescent_id"]
            isOneToOne: false
            referencedRelation: "v_adolescents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adolescent_clan_memberships_clan_id_fkey"
            columns: ["clan_id"]
            isOneToOne: false
            referencedRelation: "clans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adolescent_clan_memberships_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      adolescent_guardians: {
        Row: {
          adolescent_id: string
          created_at: string
          guardian_id: string
          is_primary: boolean
          relationship_id: string | null
        }
        Insert: {
          adolescent_id: string
          created_at?: string
          guardian_id: string
          is_primary?: boolean
          relationship_id?: string | null
        }
        Update: {
          adolescent_id?: string
          created_at?: string
          guardian_id?: string
          is_primary?: boolean
          relationship_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "adolescent_guardians_adolescent_id_fkey"
            columns: ["adolescent_id"]
            isOneToOne: false
            referencedRelation: "adolescents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adolescent_guardians_adolescent_id_fkey"
            columns: ["adolescent_id"]
            isOneToOne: false
            referencedRelation: "v_adolescents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adolescent_guardians_guardian_id_fkey"
            columns: ["guardian_id"]
            isOneToOne: false
            referencedRelation: "guardians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adolescent_guardians_relationship_id_fkey"
            columns: ["relationship_id"]
            isOneToOne: false
            referencedRelation: "guardian_relationships"
            referencedColumns: ["id"]
          },
        ]
      }
      adolescent_discipleship: {
        Row: {
          adolescent_id: string
          done: boolean
          done_on: string | null
          marked_by: string | null
          step_id: string
          updated_at: string
        }
        Insert: {
          adolescent_id: string
          done?: boolean
          done_on?: string | null
          marked_by?: string | null
          step_id: string
          updated_at?: string
        }
        Update: {
          adolescent_id?: string
          done?: boolean
          done_on?: string | null
          marked_by?: string | null
          step_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      discipleship_steps: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          slug: string
          sort_order: number
          stage: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          slug: string
          sort_order?: number
          stage: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          slug?: string
          sort_order?: number
          stage?: string
        }
        Relationships: []
      }
      adolescents: {
        Row: {
          address: string | null
          birth_date: string | null
          created_at: string
          created_by: string | null
          first_name: string
          id: string
          last_name: string
          notes: string | null
          phone: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          district: string | null
          enrolled: boolean | null
          school_name: string | null
          sex: Database["public"]["Enums"]["sex_type"]
          status: Database["public"]["Enums"]["person_status"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          district?: string | null
          enrolled?: boolean | null
          birth_date?: string | null
          created_at?: string
          created_by?: string | null
          first_name: string
          id?: string
          last_name: string
          notes?: string | null
          phone?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          school_name?: string | null
          sex: Database["public"]["Enums"]["sex_type"]
          status?: Database["public"]["Enums"]["person_status"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          district?: string | null
          enrolled?: boolean | null
          birth_date?: string | null
          created_at?: string
          created_by?: string | null
          first_name?: string
          id?: string
          last_name?: string
          notes?: string | null
          phone?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          school_name?: string | null
          sex?: Database["public"]["Enums"]["sex_type"]
          status?: Database["public"]["Enums"]["person_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "adolescents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adolescents_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      agapes: {
        Row: {
          active: boolean
          address: string | null
          created_at: string
          description: string | null
          id: string
          meeting_day: number | null
          meeting_time: string | null
          name: string
        }
        Insert: {
          active?: boolean
          address?: string | null
          created_at?: string
          description?: string | null
          id?: string
          meeting_day?: number | null
          meeting_time?: string | null
          name: string
        }
        Update: {
          active?: boolean
          address?: string | null
          created_at?: string
          description?: string | null
          id?: string
          meeting_day?: number | null
          meeting_time?: string | null
          name?: string
        }
        Relationships: []
      }
      alert_rules: {
        Row: {
          active: boolean
          consecutive_absences: number
          created_at: string
          id: string
          name: string
          severity: Database["public"]["Enums"]["alert_severity"]
        }
        Insert: {
          active?: boolean
          consecutive_absences: number
          created_at?: string
          id?: string
          name: string
          severity: Database["public"]["Enums"]["alert_severity"]
        }
        Update: {
          active?: boolean
          consecutive_absences?: number
          created_at?: string
          id?: string
          name?: string
          severity?: Database["public"]["Enums"]["alert_severity"]
        }
        Relationships: []
      }
      alerts: {
        Row: {
          adolescent_id: string
          assigned_leader_id: string | null
          consecutive_absences: number | null
          created_at: string
          id: string
          message: string
          resolution_note: string | null
          resolved_at: string | null
          resolved_by: string | null
          rule_id: string | null
          severity: Database["public"]["Enums"]["alert_severity"]
          snapshot_agape_id: string | null
          snapshot_clan_id: string | null
          status: Database["public"]["Enums"]["alert_status"]
          updated_at: string
        }
        Insert: {
          adolescent_id: string
          assigned_leader_id?: string | null
          consecutive_absences?: number | null
          created_at?: string
          id?: string
          message: string
          resolution_note?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          rule_id?: string | null
          severity: Database["public"]["Enums"]["alert_severity"]
          snapshot_agape_id?: string | null
          snapshot_clan_id?: string | null
          status?: Database["public"]["Enums"]["alert_status"]
          updated_at?: string
        }
        Update: {
          adolescent_id?: string
          assigned_leader_id?: string | null
          consecutive_absences?: number | null
          created_at?: string
          id?: string
          message?: string
          resolution_note?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          rule_id?: string | null
          severity?: Database["public"]["Enums"]["alert_severity"]
          snapshot_agape_id?: string | null
          snapshot_clan_id?: string | null
          status?: Database["public"]["Enums"]["alert_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_adolescent_id_fkey"
            columns: ["adolescent_id"]
            isOneToOne: false
            referencedRelation: "adolescents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_adolescent_id_fkey"
            columns: ["adolescent_id"]
            isOneToOne: false
            referencedRelation: "v_adolescents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_assigned_leader_id_fkey"
            columns: ["assigned_leader_id"]
            isOneToOne: false
            referencedRelation: "leaders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "alert_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_snapshot_agape_id_fkey"
            columns: ["snapshot_agape_id"]
            isOneToOne: false
            referencedRelation: "agapes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_snapshot_clan_id_fkey"
            columns: ["snapshot_clan_id"]
            isOneToOne: false
            referencedRelation: "clans"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          description: string | null
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      attendance: {
        Row: {
          adolescent_id: string
          id: string
          is_provisional: boolean
          meeting_id: string
          notes: string | null
          recorded_at: string
          recorded_by: string | null
          status: Database["public"]["Enums"]["attendance_status"]
          updated_at: string
        }
        Insert: {
          adolescent_id: string
          id?: string
          is_provisional?: boolean
          meeting_id: string
          notes?: string | null
          recorded_at?: string
          recorded_by?: string | null
          status: Database["public"]["Enums"]["attendance_status"]
          updated_at?: string
        }
        Update: {
          adolescent_id?: string
          id?: string
          is_provisional?: boolean
          meeting_id?: string
          notes?: string | null
          recorded_at?: string
          recorded_by?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_adolescent_id_fkey"
            columns: ["adolescent_id"]
            isOneToOne: false
            referencedRelation: "adolescents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_adolescent_id_fkey"
            columns: ["adolescent_id"]
            isOneToOne: false
            referencedRelation: "v_adolescents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "v_meeting_summary"
            referencedColumns: ["meeting_id"]
          },
          {
            foreignKeyName: "attendance_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          id: number
          metadata: Json | null
          record_id: string | null
          table_name: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          id?: never
          metadata?: Json | null
          record_id?: string | null
          table_name: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          id?: never
          metadata?: Json | null
          record_id?: string | null
          table_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bible_school_courses: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          id: string
          level: number
          name: string
          sort_order: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          level?: number
          name: string
          sort_order?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          level?: number
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      bible_school_enrollments: {
        Row: {
          adolescent_id: string
          completed_on: string | null
          course_id: string
          created_at: string
          id: string
          notes: string | null
          period_id: string
          started_on: string
          status: Database["public"]["Enums"]["enrollment_status"]
          updated_at: string
        }
        Insert: {
          adolescent_id: string
          completed_on?: string | null
          course_id: string
          created_at?: string
          id?: string
          notes?: string | null
          period_id: string
          started_on?: string
          status?: Database["public"]["Enums"]["enrollment_status"]
          updated_at?: string
        }
        Update: {
          adolescent_id?: string
          completed_on?: string | null
          course_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          period_id?: string
          started_on?: string
          status?: Database["public"]["Enums"]["enrollment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bible_school_enrollments_adolescent_id_fkey"
            columns: ["adolescent_id"]
            isOneToOne: false
            referencedRelation: "adolescents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bible_school_enrollments_adolescent_id_fkey"
            columns: ["adolescent_id"]
            isOneToOne: false
            referencedRelation: "v_adolescents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bible_school_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "bible_school_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bible_school_enrollments_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "periods"
            referencedColumns: ["id"]
          },
        ]
      }
      clans: {
        Row: {
          active: boolean
          color: string
          color_ink: string
          color_soft: string
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          active?: boolean
          color: string
          color_ink?: string
          color_soft?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          active?: boolean
          color?: string
          color_ink?: string
          color_soft?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      event_registrations: {
        Row: {
          adolescent_id: string | null
          amount_due: number
          created_at: string
          event_id: string
          id: string
          leader_id: string | null
          notes: string | null
          registered_by: string | null
          status: Database["public"]["Enums"]["registration_status"]
          updated_at: string
        }
        Insert: {
          adolescent_id?: string | null
          amount_due?: number
          created_at?: string
          event_id: string
          id?: string
          leader_id?: string | null
          notes?: string | null
          registered_by?: string | null
          status?: Database["public"]["Enums"]["registration_status"]
          updated_at?: string
        }
        Update: {
          adolescent_id?: string | null
          amount_due?: number
          created_at?: string
          event_id?: string
          id?: string
          leader_id?: string | null
          notes?: string | null
          registered_by?: string | null
          status?: Database["public"]["Enums"]["registration_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_adolescent_id_fkey"
            columns: ["adolescent_id"]
            isOneToOne: false
            referencedRelation: "adolescents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_registrations_adolescent_id_fkey"
            columns: ["adolescent_id"]
            isOneToOne: false
            referencedRelation: "v_adolescents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_registrations_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "leaders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_registrations_registered_by_fkey"
            columns: ["registered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_types: {
        Row: {
          active: boolean
          color: string | null
          created_at: string
          id: string
          name: string
        }
        Insert: {
          active?: boolean
          color?: string | null
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          active?: boolean
          color?: string | null
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          approval_status: Database["public"]["Enums"]["event_approval_status"]
          agape_id: string | null
          capacity: number | null
          clan_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          ends_at: string | null
          event_type_id: string | null
          fee_amount: number
          id: string
          location: string | null
          period_id: string | null
          registration_deadline: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          requires_registration: boolean
          scope: Database["public"]["Enums"]["event_scope"]
          starts_at: string
          title: string
          updated_at: string
        }
        Insert: {
          approval_status?: Database["public"]["Enums"]["event_approval_status"]
          agape_id?: string | null
          capacity?: number | null
          clan_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          event_type_id?: string | null
          fee_amount?: number
          id?: string
          location?: string | null
          period_id?: string | null
          registration_deadline?: string | null
          requires_registration?: boolean
          scope?: Database["public"]["Enums"]["event_scope"]
          starts_at: string
          title: string
          updated_at?: string
        }
        Update: {
          approval_status?: Database["public"]["Enums"]["event_approval_status"]
          agape_id?: string | null
          capacity?: number | null
          clan_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          event_type_id?: string | null
          fee_amount?: number
          id?: string
          location?: string | null
          period_id?: string | null
          registration_deadline?: string | null
          requires_registration?: boolean
          scope?: Database["public"]["Enums"]["event_scope"]
          starts_at?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_agape_id_fkey"
            columns: ["agape_id"]
            isOneToOne: false
            referencedRelation: "agapes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_clan_id_fkey"
            columns: ["clan_id"]
            isOneToOne: false
            referencedRelation: "clans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_event_type_id_fkey"
            columns: ["event_type_id"]
            isOneToOne: false
            referencedRelation: "event_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "periods"
            referencedColumns: ["id"]
          },
        ]
      }
      follow_up_notes: {
        Row: {
          adolescent_id: string
          alert_id: string | null
          author_id: string | null
          body: string
          created_at: string
          id: string
          occurred_at: string
          type: Database["public"]["Enums"]["follow_up_type"]
        }
        Insert: {
          adolescent_id: string
          alert_id?: string | null
          author_id?: string | null
          body: string
          created_at?: string
          id?: string
          occurred_at?: string
          type?: Database["public"]["Enums"]["follow_up_type"]
        }
        Update: {
          adolescent_id?: string
          alert_id?: string | null
          author_id?: string | null
          body?: string
          created_at?: string
          id?: string
          occurred_at?: string
          type?: Database["public"]["Enums"]["follow_up_type"]
        }
        Relationships: [
          {
            foreignKeyName: "follow_up_notes_adolescent_id_fkey"
            columns: ["adolescent_id"]
            isOneToOne: false
            referencedRelation: "adolescents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follow_up_notes_adolescent_id_fkey"
            columns: ["adolescent_id"]
            isOneToOne: false
            referencedRelation: "v_adolescents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follow_up_notes_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follow_up_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      connection_followups: {
        Row: {
          adolescent_id: string
          availability: string | null
          created_at: string
          created_by: string | null
          id: string
          next_contact_on: string | null
          notes: string
          occurred_on: string
          status: Database["public"]["Enums"]["connection_status"]
          suggested_agape_id: string | null
          updated_at: string
        }
        Insert: {
          approval_status?: Database["public"]["Enums"]["event_approval_status"]
          adolescent_id: string
          availability?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          next_contact_on?: string | null
          notes: string
          occurred_on?: string
          status?: Database["public"]["Enums"]["connection_status"]
          suggested_agape_id?: string | null
          updated_at?: string
        }
        Update: {
          approval_status?: Database["public"]["Enums"]["event_approval_status"]
          adolescent_id?: string
          availability?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          next_contact_on?: string | null
          notes?: string
          occurred_on?: string
          status?: Database["public"]["Enums"]["connection_status"]
          suggested_agape_id?: string | null
          updated_at?: string
        }
        Relationships: [
          { foreignKeyName: "connection_followups_adolescent_id_fkey", columns: ["adolescent_id"], isOneToOne: false, referencedRelation: "adolescents", referencedColumns: ["id"] },
          { foreignKeyName: "connection_followups_adolescent_id_fkey", columns: ["adolescent_id"], isOneToOne: false, referencedRelation: "v_adolescents", referencedColumns: ["id"] },
          { foreignKeyName: "connection_followups_created_by_fkey", columns: ["created_by"], isOneToOne: false, referencedRelation: "profiles", referencedColumns: ["id"] },
          { foreignKeyName: "connection_followups_suggested_agape_id_fkey", columns: ["suggested_agape_id"], isOneToOne: false, referencedRelation: "agapes", referencedColumns: ["id"] },
        ]
      }
      guardian_relationships: {
        Row: {
          active: boolean
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          active?: boolean
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          active?: boolean
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      guardians: {
        Row: {
          created_at: string
          email: string | null
          first_name: string
          id: string
          last_name: string
          phone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name: string
          id?: string
          last_name: string
          phone: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          phone?: string
          updated_at?: string
        }
        Relationships: []
      }
      leader_agape_assignments: {
        Row: {
          agape_id: string
          created_at: string
          created_by: string | null
          ended_on: string | null
          id: string
          leader_id: string
          role: Database["public"]["Enums"]["leader_role"]
          started_on: string
        }
        Insert: {
          agape_id: string
          created_at?: string
          created_by?: string | null
          ended_on?: string | null
          id?: string
          leader_id: string
          role?: Database["public"]["Enums"]["leader_role"]
          started_on?: string
        }
        Update: {
          agape_id?: string
          created_at?: string
          created_by?: string | null
          ended_on?: string | null
          id?: string
          leader_id?: string
          role?: Database["public"]["Enums"]["leader_role"]
          started_on?: string
        }
        Relationships: [
          {
            foreignKeyName: "leader_agape_assignments_agape_id_fkey"
            columns: ["agape_id"]
            isOneToOne: false
            referencedRelation: "agapes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leader_agape_assignments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leader_agape_assignments_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "leaders"
            referencedColumns: ["id"]
          },
        ]
      }
      leader_clan_memberships: {
        Row: {
          clan_id: string
          created_at: string
          ended_on: string | null
          id: string
          leader_id: string
          started_on: string
        }
        Insert: {
          clan_id: string
          created_at?: string
          ended_on?: string | null
          id?: string
          leader_id: string
          started_on?: string
        }
        Update: {
          clan_id?: string
          created_at?: string
          ended_on?: string | null
          id?: string
          leader_id?: string
          started_on?: string
        }
        Relationships: [
          {
            foreignKeyName: "leader_clan_memberships_clan_id_fkey"
            columns: ["clan_id"]
            isOneToOne: false
            referencedRelation: "clans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leader_clan_memberships_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "leaders"
            referencedColumns: ["id"]
          },
        ]
      }
      leaders: {
        Row: {
          birth_date: string | null
          created_at: string
          connection_enabled: boolean
          email: string | null
          first_name: string
          id: string
          last_name: string
          notes: string | null
          phone: string | null
          profile_id: string | null
          sex: Database["public"]["Enums"]["sex_type"]
          status: Database["public"]["Enums"]["person_status"]
          updated_at: string
        }
        Insert: {
          birth_date?: string | null
          created_at?: string
          connection_enabled?: boolean
          email?: string | null
          first_name: string
          id?: string
          last_name: string
          notes?: string | null
          phone?: string | null
          profile_id?: string | null
          sex: Database["public"]["Enums"]["sex_type"]
          status?: Database["public"]["Enums"]["person_status"]
          updated_at?: string
        }
        Update: {
          birth_date?: string | null
          created_at?: string
          connection_enabled?: boolean
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          notes?: string | null
          phone?: string | null
          profile_id?: string | null
          sex?: Database["public"]["Enums"]["sex_type"]
          status?: Database["public"]["Enums"]["person_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leaders_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      materials: {
        Row: {
          body: string | null
          created_at: string
          description: string | null
          external_url: string | null
          file_name: string | null
          id: string
          kind: "file" | "link" | "note"
          mime_type: string | null
          size_bytes: number | null
          storage_path: string | null
          title: string
          uploaded_by: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          description?: string | null
          external_url?: string | null
          file_name?: string | null
          id?: string
          kind?: "file" | "link" | "note"
          mime_type?: string | null
          size_bytes?: number | null
          storage_path?: string | null
          title: string
          uploaded_by?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string
          description?: string | null
          external_url?: string | null
          file_name?: string | null
          id?: string
          kind?: "file" | "link" | "note"
          mime_type?: string | null
          size_bytes?: number | null
          storage_path?: string | null
          title?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      meeting_leaders: {
        Row: {
          created_at: string
          leader_id: string
          meeting_id: string
        }
        Insert: {
          created_at?: string
          leader_id: string
          meeting_id: string
        }
        Update: {
          created_at?: string
          leader_id?: string
          meeting_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_leaders_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "leaders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_leaders_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_leaders_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "v_meeting_summary"
            referencedColumns: ["meeting_id"]
          },
        ]
      }
      meeting_types: {
        Row: {
          active: boolean
          counts_for_alerts: boolean
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          active?: boolean
          counts_for_alerts?: boolean
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          active?: boolean
          counts_for_alerts?: boolean
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      meetings: {
        Row: {
          agape_id: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          meeting_date: string
          meeting_type_id: string
          period_id: string
          topic: string
          updated_at: string
        }
        Insert: {
          agape_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          meeting_date: string
          meeting_type_id: string
          period_id: string
          topic: string
          updated_at?: string
        }
        Update: {
          agape_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          meeting_date?: string
          meeting_type_id?: string
          period_id?: string
          topic?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetings_agape_id_fkey"
            columns: ["agape_id"]
            isOneToOne: false
            referencedRelation: "agapes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_meeting_type_id_fkey"
            columns: ["meeting_type_id"]
            isOneToOne: false
            referencedRelation: "meeting_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "periods"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          link: string | null
          message: string
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          link?: string | null
          message: string
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          method: Database["public"]["Enums"]["payment_method"]
          paid_at: string
          received_by: string | null
          reference: string | null
          registration_id: string
          status: Database["public"]["Enums"]["payment_status"]
          voided_by: string | null
          voided_reason: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          method: Database["public"]["Enums"]["payment_method"]
          paid_at?: string
          received_by?: string | null
          reference?: string | null
          registration_id: string
          status?: Database["public"]["Enums"]["payment_status"]
          voided_by?: string | null
          voided_reason?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          paid_at?: string
          received_by?: string | null
          reference?: string | null
          registration_id?: string
          status?: Database["public"]["Enums"]["payment_status"]
          voided_by?: string | null
          voided_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_received_by_fkey"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "event_registrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_voided_by_fkey"
            columns: ["voided_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      periods: {
        Row: {
          created_at: string
          ends_on: string
          id: string
          is_current: boolean
          name: string
          starts_on: string
          year: number
        }
        Insert: {
          created_at?: string
          ends_on: string
          id?: string
          is_current?: boolean
          name: string
          starts_on: string
          year: number
        }
        Update: {
          created_at?: string
          ends_on?: string
          id?: string
          is_current?: boolean
          name?: string
          starts_on?: string
          year?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          active: boolean
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          active?: boolean
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          active?: boolean
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      staging_adolescents: {
        Row: {
          adolescent_id: string | null
          agape_name: string | null
          batch: string
          bible_course: string | null
          birth_date: string | null
          clan_name: string | null
          created_at: string
          first_name: string | null
          guardian_first_name: string | null
          guardian_last_name: string | null
          guardian_phone: string | null
          guardian_relationship: string | null
          id: number
          import_error: string | null
          import_status: Database["public"]["Enums"]["import_status"]
          last_name: string | null
          phone: string | null
          school_name: string | null
          sex: string | null
        }
        Insert: {
          adolescent_id?: string | null
          agape_name?: string | null
          batch?: string
          bible_course?: string | null
          birth_date?: string | null
          clan_name?: string | null
          created_at?: string
          first_name?: string | null
          guardian_first_name?: string | null
          guardian_last_name?: string | null
          guardian_phone?: string | null
          guardian_relationship?: string | null
          id?: never
          import_error?: string | null
          import_status?: Database["public"]["Enums"]["import_status"]
          last_name?: string | null
          phone?: string | null
          school_name?: string | null
          sex?: string | null
        }
        Update: {
          adolescent_id?: string | null
          agape_name?: string | null
          batch?: string
          bible_course?: string | null
          birth_date?: string | null
          clan_name?: string | null
          created_at?: string
          first_name?: string | null
          guardian_first_name?: string | null
          guardian_last_name?: string | null
          guardian_phone?: string | null
          guardian_relationship?: string | null
          id?: never
          import_error?: string | null
          import_status?: Database["public"]["Enums"]["import_status"]
          last_name?: string | null
          phone?: string | null
          school_name?: string | null
          sex?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staging_adolescents_adolescent_id_fkey"
            columns: ["adolescent_id"]
            isOneToOne: false
            referencedRelation: "adolescents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staging_adolescents_adolescent_id_fkey"
            columns: ["adolescent_id"]
            isOneToOne: false
            referencedRelation: "v_adolescents"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_my_context: {
        Row: {
          agape_id: string | null
          agape_name: string | null
          agape_role: Database["public"]["Enums"]["leader_role"] | null
          clan_color: string | null
          clan_color_ink: string | null
          clan_color_soft: string | null
          clan_id: string | null
          clan_name: string | null
          clan_slug: string | null
          full_name: string | null
          leader_id: string | null
          profile_id: string | null
          role: Database["public"]["Enums"]["app_role"] | null
        }
        Relationships: []
      }
      v_adolescents: {
        Row: {
          agape_id: string | null
          agape_name: string | null
          age: number | null
          birth_date: string | null
          clan_color: string | null
          clan_color_ink: string | null
          clan_color_soft: string | null
          clan_id: string | null
          clan_name: string | null
          address: string | null
          clan_slug: string | null
          course_id: string | null
          course_name: string | null
          discipleship_done: number | null
          discipleship_total: number | null
          district: string | null
          enrolled: boolean | null
          created_at: string | null
          created_by: string | null
          first_name: string | null
          full_name: string | null
          guardian_name: string | null
          guardian_phone: string | null
          guardian_relationship: string | null
          id: string | null
          last_name: string | null
          phone: string | null
          school_name: string | null
          sex: Database["public"]["Enums"]["sex_type"] | null
          status: Database["public"]["Enums"]["person_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "adolescent_agape_memberships_agape_id_fkey"
            columns: ["agape_id"]
            isOneToOne: false
            referencedRelation: "agapes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adolescent_clan_memberships_clan_id_fkey"
            columns: ["clan_id"]
            isOneToOne: false
            referencedRelation: "clans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adolescents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      v_attendance_rate: {
        Row: {
          absent: number | null
          adolescent_id: string | null
          attendance_pct: number | null
          attended: number | null
          justified: number | null
          period_id: string | null
          recorded: number | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_adolescent_id_fkey"
            columns: ["adolescent_id"]
            isOneToOne: false
            referencedRelation: "adolescents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_adolescent_id_fkey"
            columns: ["adolescent_id"]
            isOneToOne: false
            referencedRelation: "v_adolescents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "periods"
            referencedColumns: ["id"]
          },
        ]
      }
      v_meeting_summary: {
        Row: {
          absent: number | null
          agape_id: string | null
          agape_name: string | null
          justified: number | null
          late: number | null
          meeting_date: string | null
          meeting_id: string | null
          meeting_type: string | null
          period_id: string | null
          present: number | null
          provisional: number | null
          recorded: number | null
          topic: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meetings_agape_id_fkey"
            columns: ["agape_id"]
            isOneToOne: false
            referencedRelation: "agapes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "periods"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      can_view_adolescent: {
        Args: { p_adolescent_id: string }
        Returns: boolean
      }
      can_write_attendance: {
        Args: { p_adolescent_id: string; p_meeting_id: string }
        Returns: boolean
      }
      current_leader_id: { Args: never; Returns: string }
      current_period_id: { Args: never; Returns: string }
      is_admin: { Args: never; Returns: boolean }
      my_agape_ids: { Args: never; Returns: string[] }
      my_clan_ids: { Args: never; Returns: string[] }
      process_staging_adolescents: {
        Args: { p_batch?: string }
        Returns: {
          failed: number
          imported: number
        }[]
      }
      purge_rejected_adolescents: { Args: never; Returns: number }
      refresh_absence_alerts: { Args: never; Returns: number }
      register_adolescent: {
        Args: {
          p_address?: string
          p_agape_id: string
          p_birth_date?: string
          p_clan_id?: string
          p_district?: string
          p_enrolled?: boolean
          p_first_name: string
          p_guardian?: Json
          p_last_name: string
          p_phone?: string
          p_school_name?: string
          p_sex: Database["public"]["Enums"]["sex_type"]
        }
        Returns: string
      }
      set_adolescent_clan: {
        Args: { p_adolescent_id: string; p_clan_id?: string }
        Returns: undefined
      }
      set_adolescent_course: {
        Args: { p_adolescent_id: string; p_course_id?: string }
        Returns: undefined
      }
      set_adolescent_discipleship: {
        Args: { p_adolescent_id: string; p_done: boolean; p_step_id: string }
        Returns: undefined
      }
      update_adolescent: {
        Args: {
          p_address?: string
          p_adolescent_id: string
          p_birth_date?: string
          p_district?: string
          p_enrolled?: boolean
          p_first_name: string
          p_last_name: string
          p_phone?: string
          p_school_name?: string
          p_sex: Database["public"]["Enums"]["sex_type"]
        }
        Returns: undefined
      }
      update_my_profile: {
        Args: {
          p_birth_date?: string
          p_full_name: string
          p_phone?: string
          p_sex?: Database["public"]["Enums"]["sex_type"]
        }
        Returns: undefined
      }
      review_adolescent: {
        Args: { p_adolescent_id: string; p_approve: boolean; p_reason?: string }
        Returns: {
          birth_date: string | null
          created_at: string
          created_by: string | null
          first_name: string
          id: string
          last_name: string
          notes: string | null
          phone: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          school_name: string | null
          sex: Database["public"]["Enums"]["sex_type"]
          status: Database["public"]["Enums"]["person_status"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "adolescents"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      setting_int: {
        Args: { p_default: number; p_key: string }
        Returns: number
      }
      today_lima: { Args: never; Returns: string }
      transfer_adolescent: {
        Args: {
          p_adolescent_id: string
          p_agape_id?: string
          p_clan_id?: string
          p_effective_on?: string
        }
        Returns: undefined
      }
    }
    Enums: {
      event_approval_status: "pending" | "published" | "rejected"
      connection_status: "new" | "contacted" | "scheduled" | "referred" | "closed"
      alert_severity: "info" | "warning" | "critical"
      alert_status: "open" | "in_progress" | "resolved" | "dismissed"
      app_role: "admin" | "leader"
      attendance_status: "present" | "absent" | "justified" | "late"
      enrollment_status: "in_progress" | "completed" | "dropped"
      event_scope: "general" | "clan" | "agape"
      follow_up_type: "note" | "call" | "message" | "visit"
      import_status: "pending" | "imported" | "error"
      leader_role: "lead" | "assistant"
      payment_method: "cash" | "transfer" | "yape" | "plin" | "card" | "other"
      payment_status: "valid" | "voided"
      person_status: "pending" | "active" | "inactive" | "archived" | "rejected"
      registration_status: "registered" | "confirmed" | "cancelled" | "attended"
      sex_type: "male" | "female"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      alert_severity: ["info", "warning", "critical"],
      alert_status: ["open", "in_progress", "resolved", "dismissed"],
      app_role: ["admin", "leader"],
      attendance_status: ["present", "absent", "justified", "late"],
      enrollment_status: ["in_progress", "completed", "dropped"],
      event_scope: ["general", "clan", "agape"],
      follow_up_type: ["note", "call", "message", "visit"],
      import_status: ["pending", "imported", "error"],
      leader_role: ["lead", "assistant"],
      payment_method: ["cash", "transfer", "yape", "plin", "card", "other"],
      payment_status: ["valid", "voided"],
      person_status: ["pending", "active", "inactive", "archived", "rejected"],
      registration_status: ["registered", "confirmed", "cancelled", "attended"],
      sex_type: ["male", "female"],
    },
  },
} as const
