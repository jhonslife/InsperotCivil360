# Skill: Dashboard de Indicadores

> Implementar dashboard com indicadores consolidados para módulo ou visão geral
> **Agente**: @Relatorios + @BancoDados

---

## Quando Usar

- Criar dashboard para novo módulo (ex: pavimentação, fundações)
- Expandir HomeScreen com novos indicadores
- Criar tela de indicadores consolidados por obra

---

## Componentes de Dashboard

### StatCard (existente em `src/components/StatCard.tsx`)

```typescript
interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;          // MaterialCommunityIcons name
  color: string;         // COLORS constant
  onPress?: () => void;
}
```

### Layout Padrão

```
┌──────────────────────────────────┐
│  Header — Título do Dashboard     │
├──────────┬───────────┬───────────┤
│ StatCard │ StatCard  │ StatCard  │
│ Total    │ Conformes │ NC        │
├──────────┴───────────┴───────────┤
│  Gráfico ou Lista de Resumo      │
├──────────────────────────────────┤
│  Últimas Inspeções (FlatList)    │
└──────────────────────────────────┘
```

---

## Indicadores por Módulo

### Dashboard Geral (HomeScreen)

| Indicador | Query | Ícone |
|-----------|-------|-------|
| Total de Obras | `SELECT COUNT(*) FROM obras WHERE status = 'ativa'` | `briefcase` |
| Inspeções do Mês | `SELECT COUNT(*) FROM inspections WHERE data >= ?` | `clipboard-check` |
| NCs Abertas | `SELECT COUNT(*) FROM rnc WHERE status = 'aberta'` | `alert-circle` |
| Ensaios Pendentes | `SELECT COUNT(*) FROM ensaios WHERE status = 'pendente'` | `flask` |

### Dashboard Pavimentação

| Indicador | Query | Ícone |
|-----------|-------|-------|
| Inspeções por Camada | `GROUP BY camada` | `layers` |
| Compactação Média | `AVG(grau_compactacao)` | `percent` |
| Trechos com NC | `WHERE status = 'nao_conforme'` | `road` |
| KMs Inspecionados | `COUNT(DISTINCT km_inicial)` | `map-marker-distance` |

### Dashboard Fundações

| Indicador | Query | Ícone |
|-----------|-------|-------|
| Por Tipo de Fundação | `GROUP BY tipo_fundacao` | `pillar` |
| Conformidade Geral | `% de conforme` | `check-circle` |
| NCs por Tipo | `JOIN rnc WHERE origem_tipo = 'fundacao'` | `alert` |

### Dashboard Concreto

| Indicador | Query | Ícone |
|-----------|-------|-------|
| CPs Rompidos | `COUNT(*) FROM rompimento_cp` | `flask-outline` |
| Resistência Média | `AVG(resistencia_mpa)` | `arm-flex` |
| CPs Abaixo do fck | `WHERE resistencia_mpa < fck * 0.95` | `alert-circle` |
| Slump Médio | `AVG(slump_test)` | `water` |

---

## Padrão de Repository para Dashboard

```typescript
// Em cada repository, adicionar métodos de estatística:

export const moduloRepository = {
  // ... CRUD existente ...

  async getStats(obraId?: string): Promise<ModuloStats> {
    const db = await getDatabase();
    const where = obraId ? 'WHERE obra_id = ?' : '';
    const params = obraId ? [obraId] : [];

    const total = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM modulo ${where}`, params
    );
    const conformes = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM modulo ${where ? where + ' AND' : 'WHERE'} status = 'conforme'`, params
    );
    const naoConformes = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM modulo ${where ? where + ' AND' : 'WHERE'} status = 'nao_conforme'`, params
    );

    return {
      total: total?.count ?? 0,
      conformes: conformes?.count ?? 0,
      naoConformes: naoConformes?.count ?? 0,
      percentualConformidade: total?.count
        ? Math.round((conformes?.count ?? 0) / total.count * 100)
        : 0,
    };
  },
};

interface ModuloStats {
  total: number;
  conformes: number;
  naoConformes: number;
  percentualConformidade: number;
}
```

---

## Template de Tela Dashboard

```typescript
const DashboardScreen: React.FC = () => {
  const [stats, setStats] = useState<ModuloStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await moduloRepository.getStats(obraId);
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar indicadores:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ActivityIndicator />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <Header title="Dashboard — Módulo" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.statsRow}>
          <StatCard title="Total" value={stats?.total ?? 0} icon="clipboard-list" color={COLORS.primary} />
          <StatCard title="Conformes" value={stats?.conformes ?? 0} icon="check-circle" color={COLORS.success} />
          <StatCard title="NCs" value={stats?.naoConformes ?? 0} icon="alert-circle" color={COLORS.error} />
        </View>
        <StatCard
          title="Conformidade"
          value={`${stats?.percentualConformidade ?? 0}%`}
          icon="percent"
          color={COLORS.secondary}
        />
      </ScrollView>
    </SafeAreaView>
  );
};
```

---

## Cores dos Indicadores

```yaml
total: COLORS.primary (#1B3A5C)
conformes: COLORS.success (#10B981)
nao_conformes: COLORS.error (#EF4444)
alertas: COLORS.warning (#F59E0B)
neutro: COLORS.secondary (#2E5C8A)
percentual: COLORS.accent (#E8762B)
```

---

## Validação

- [ ] Queries com parameterized params (?)
- [ ] Loading state enquanto carrega dados
- [ ] Cores do Design System (COLORS)
- [ ] StatCard para cada indicador-chave
- [ ] Dados atualizados ao focar na tela (useFocusEffect)
- [ ] Componentes existentes reutilizados (StatCard, Header)
