// Tipos gerados manualmente a partir de supabase/migrations/*.sql.
// Ao alterar o schema, atualize este arquivo (ou rode `supabase gen types typescript`).

export type UserRole = "dono" | "professor" | "aluno" | "aluno_menor" | "responsavel";
export type FaixaCategoria = "adulto" | "infantil";
export type StatusMensalidade = "pago" | "pendente" | "atrasado";
export type CriterioAvaliacao = "tecnica" | "disciplina" | "assiduidade" | "condicionamento";

type Relationship = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne?: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string | null;
          phone: string | null;
          avatar_url: string | null;
          role: UserRole;
          birth_date: string | null;
          faixa_categoria: FaixaCategoria | null;
          desconto_percentual: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: string;
          full_name: string;
          role: UserRole;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      responsaveis_alunos: {
        Row: {
          id: string;
          responsavel_id: string;
          aluno_id: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["responsaveis_alunos"]["Row"]> & {
          responsavel_id: string;
          aluno_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["responsaveis_alunos"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "responsaveis_alunos_responsavel_id_fkey";
            columns: ["responsavel_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "responsaveis_alunos_aluno_id_fkey";
            columns: ["aluno_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      turmas: {
        Row: {
          id: string;
          nome: string;
          faixa_etaria: FaixaCategoria;
          dias_semana: number[];
          horario_inicio: string;
          horario_fim: string;
          ativo: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["turmas"]["Row"]> & {
          nome: string;
          faixa_etaria: FaixaCategoria;
          horario_inicio: string;
          horario_fim: string;
        };
        Update: Partial<Database["public"]["Tables"]["turmas"]["Row"]>;
        Relationships: [];
      };
      turma_professores: {
        Row: { turma_id: string; professor_id: string };
        Insert: { turma_id: string; professor_id: string };
        Update: Partial<{ turma_id: string; professor_id: string }>;
        Relationships: [
          {
            foreignKeyName: "turma_professores_turma_id_fkey";
            columns: ["turma_id"];
            isOneToOne: false;
            referencedRelation: "turmas";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "turma_professores_professor_id_fkey";
            columns: ["professor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      matriculas: {
        Row: {
          id: string;
          turma_id: string;
          aluno_id: string;
          ativo: boolean;
          data_matricula: string;
        };
        Insert: Partial<Database["public"]["Tables"]["matriculas"]["Row"]> & {
          turma_id: string;
          aluno_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["matriculas"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "matriculas_turma_id_fkey";
            columns: ["turma_id"];
            isOneToOne: false;
            referencedRelation: "turmas";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matriculas_aluno_id_fkey";
            columns: ["aluno_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      aulas: {
        Row: {
          id: string;
          turma_id: string;
          data: string;
          professor_id: string | null;
          observacao: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["aulas"]["Row"]> & {
          turma_id: string;
          data: string;
        };
        Update: Partial<Database["public"]["Tables"]["aulas"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "aulas_turma_id_fkey";
            columns: ["turma_id"];
            isOneToOne: false;
            referencedRelation: "turmas";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "aulas_professor_id_fkey";
            columns: ["professor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      presencas: {
        Row: {
          id: string;
          aula_id: string;
          aluno_id: string;
          presente: boolean;
          registrado_por: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["presencas"]["Row"]> & {
          aula_id: string;
          aluno_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["presencas"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "presencas_aula_id_fkey";
            columns: ["aula_id"];
            isOneToOne: false;
            referencedRelation: "aulas";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "presencas_aluno_id_fkey";
            columns: ["aluno_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "presencas_registrado_por_fkey";
            columns: ["registrado_por"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      graduacoes: {
        Row: {
          id: string;
          aluno_id: string;
          professor_id: string | null;
          faixa_categoria: FaixaCategoria;
          faixa: string;
          grau: number;
          data: string;
          observacao: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["graduacoes"]["Row"]> & {
          aluno_id: string;
          faixa_categoria: FaixaCategoria;
          faixa: string;
        };
        Update: Partial<Database["public"]["Tables"]["graduacoes"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "graduacoes_aluno_id_fkey";
            columns: ["aluno_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "graduacoes_professor_id_fkey";
            columns: ["professor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      avaliacoes: {
        Row: {
          id: string;
          aluno_id: string;
          professor_id: string;
          data: string;
          nota_geral: number | null;
          comentario: string | null;
          graduacao_id: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["avaliacoes"]["Row"]> & {
          aluno_id: string;
          professor_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["avaliacoes"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "avaliacoes_aluno_id_fkey";
            columns: ["aluno_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "avaliacoes_professor_id_fkey";
            columns: ["professor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "avaliacoes_graduacao_id_fkey";
            columns: ["graduacao_id"];
            isOneToOne: false;
            referencedRelation: "graduacoes";
            referencedColumns: ["id"];
          },
        ];
      };
      avaliacao_criterios: {
        Row: {
          id: string;
          avaliacao_id: string;
          criterio: CriterioAvaliacao;
          nota: number;
        };
        Insert: Partial<Database["public"]["Tables"]["avaliacao_criterios"]["Row"]> & {
          avaliacao_id: string;
          criterio: CriterioAvaliacao;
          nota: number;
        };
        Update: Partial<Database["public"]["Tables"]["avaliacao_criterios"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "avaliacao_criterios_avaliacao_id_fkey";
            columns: ["avaliacao_id"];
            isOneToOne: false;
            referencedRelation: "avaliacoes";
            referencedColumns: ["id"];
          },
        ];
      };
      planos: {
        Row: {
          id: string;
          nome: string;
          valor: number;
          periodicidade: string;
          ativo: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["planos"]["Row"]> & {
          nome: string;
          valor: number;
        };
        Update: Partial<Database["public"]["Tables"]["planos"]["Row"]>;
        Relationships: [];
      };
      mensalidades: {
        Row: {
          id: string;
          aluno_id: string;
          plano_id: string | null;
          mes_referencia: string;
          valor: number;
          status: StatusMensalidade;
          data_pagamento: string | null;
          forma_pagamento: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["mensalidades"]["Row"]> & {
          aluno_id: string;
          mes_referencia: string;
          valor: number;
        };
        Update: Partial<Database["public"]["Tables"]["mensalidades"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "mensalidades_aluno_id_fkey";
            columns: ["aluno_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "mensalidades_plano_id_fkey";
            columns: ["plano_id"];
            isOneToOne: false;
            referencedRelation: "planos";
            referencedColumns: ["id"];
          },
        ];
      };
      chat_turma_mensagens: {
        Row: {
          id: string;
          turma_id: string;
          autor_id: string;
          mensagem: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["chat_turma_mensagens"]["Row"]> & {
          turma_id: string;
          autor_id: string;
          mensagem: string;
        };
        Update: Partial<Database["public"]["Tables"]["chat_turma_mensagens"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "chat_turma_mensagens_turma_id_fkey";
            columns: ["turma_id"];
            isOneToOne: false;
            referencedRelation: "turmas";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "chat_turma_mensagens_autor_id_fkey";
            columns: ["autor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      mural_avisos: {
        Row: {
          id: string;
          autor_id: string;
          titulo: string;
          mensagem: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["mural_avisos"]["Row"]> & {
          autor_id: string;
          titulo: string;
          mensagem: string;
        };
        Update: Partial<Database["public"]["Tables"]["mural_avisos"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "mural_avisos_autor_id_fkey";
            columns: ["autor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      conversas_diretas: {
        Row: {
          id: string;
          participante_a: string;
          participante_b: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["conversas_diretas"]["Row"]> & {
          participante_a: string;
          participante_b: string;
        };
        Update: Partial<Database["public"]["Tables"]["conversas_diretas"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "conversas_diretas_participante_a_fkey";
            columns: ["participante_a"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "conversas_diretas_participante_b_fkey";
            columns: ["participante_b"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      mensagens_diretas: {
        Row: {
          id: string;
          conversa_id: string;
          autor_id: string;
          mensagem: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["mensagens_diretas"]["Row"]> & {
          conversa_id: string;
          autor_id: string;
          mensagem: string;
        };
        Update: Partial<Database["public"]["Tables"]["mensagens_diretas"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "mensagens_diretas_conversa_id_fkey";
            columns: ["conversa_id"];
            isOneToOne: false;
            referencedRelation: "conversas_diretas";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "mensagens_diretas_autor_id_fkey";
            columns: ["autor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      chat_leituras: {
        Row: {
          usuario_id: string;
          contexto_tipo: "turma" | "direta";
          contexto_id: string;
          last_read_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["chat_leituras"]["Row"]> & {
          usuario_id: string;
          contexto_tipo: "turma" | "direta";
          contexto_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["chat_leituras"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      staff_directory: {
        Args: Record<string, never>;
        Returns: { id: string; full_name: string; role: UserRole }[];
      };
    };
    Enums: {
      user_role: UserRole;
      faixa_categoria: FaixaCategoria;
      status_mensalidade: StatusMensalidade;
      criterio_avaliacao: CriterioAvaliacao;
    };
  };
}

// mantém o tipo Relationship "usado" para ferramentas de geração futuras
export type { Relationship };
