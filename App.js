import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { StatusBar } from 'expo-status-bar';
import Svg, { Circle, Path, Line } from 'react-native-svg';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';

const COLORS = {
  background: '#EDF6FD',
  teal: '#54B3AB',
  navy: '#0E294B',
  accent: '#F0C377',
  white: '#FFFFFF',
  slate: '#27415C',
  softSlate: '#58738F',
  border: '#D4E3F4',
  muted: '#6F829A',
};

const BASE_SALARY = 44000;
const PAY_PERIODS_PER_YEAR = 26;
const PAYCHECKS_YTD = 16;
const EMPLOYER_MATCH_RATE = 0.5;
const EMPLOYER_MATCH_CAP = 0.04;

const percentageBenchmarks = [
  { value: 3, label: 'Roughly 1 in 4 employees land near 3%.' },
  { value: 4, label: 'About 38% of small-business savers choose ~4%.' },
  { value: 6, label: 'Only 18% commit to 6% or more.' },
  { value: 10, label: 'Top 10% contribute 10%+ of every paycheck.' },
];

const fixedBenchmarks = [
  { value: 50, label: 'Popular starting point for consistent savers.' },
  { value: 75, label: 'Matches the national median for dollar elections.' },
  { value: 150, label: 'Represents a strong, growth-oriented contribution.' },
];

const infoPanels = {
  overview: {
    title: 'Why Contributions Matter',
    body: [
      'Your 401(k) contribution is taken out before taxes, letting you invest more of each paycheck.',
      'Berry Clean matches 50% of what you put in, up to 4%. Free money helps you hit your goals faster.',
    ],
  },
  insights: {
    title: 'Average Employee Choices',
    body: [
      'Most cleaning team leads at similar companies stay between 3% and 6%.',
      'Employees who automate increases by 1% a year reach retirement goals 7 years sooner on average.',
    ],
  },
  impact: {
    title: 'Long-Term Impact',
    body: [
      'Consistent contributions, even small ones, compound over decades.',
      'Matching dollars invested earlier have more time to grow—stick with it through market ups and downs.',
    ],
  },
  faq: {
    title: 'FAQ',
    body: [
      '1. What are 401(k) contributions?\n401(k) contributions are the amounts of money that you (the employee) and sometimes your employer set aside for your retirement. They’re usually taken automatically from each paycheck and invested in funds like stocks and bonds.',
      '2. How do I contribute to my 401(k)?\nYou can choose to contribute either a percentage of your paycheck (for example, 6%) or a fixed dollar amount (like $200 per pay period). These contributions are automatically deducted from your salary before you get paid.',
      '3. What’s the difference between Traditional and Roth 401(k) contributions?\nTraditional 401(k): Contributions are made before taxes, lowering your taxable income now. You’ll pay taxes when you withdraw the money in retirement.\n\nRoth 401(k): Contributions are made after taxes, so your withdrawals in retirement are tax-free.',
      '4. Does my employer contribute too?\nMany employers offer matching contributions, meaning they’ll add extra money to your account based on what you contribute.\n\nExample:\n“We match 50% of the first 6% you contribute.”\nIf you earn $60,000 and contribute 6% ($3,600), your employer adds another $1,800 — free money toward your retirement.',
      '5. How much can I contribute each year?\nThe IRS sets annual contribution limits. For 2025:\n• Up to $23,000 if you’re under 50.\n• Up to $30,500 if you’re 50 or older (includes $7,500 catch-up contribution).',
      '6. Where does my contribution go?\nYour money is invested in the options you select (like mutual funds or target-date funds). Over time, these investments can grow and compound to build your retirement savings.',
      '7. What does “vesting” mean?\nVesting determines how much of your employer’s contributions you actually own.\n\n• Your contributions are always 100% yours.\n• Employer contributions may vest over time (e.g., 20% per year for five years). If you leave the company before you’re fully vested, you might forfeit some of the employer match.',
      '8. Can I change my contribution amount later?\nYes! Most plans let you adjust your contribution rate anytime — for example, increasing it from 5% to 6% as your salary grows. Even a small increase can make a big difference over time.',
      '9. What happens if I leave my job?\nYour contributions (and vested employer contributions) stay yours. You can usually:\n• Leave your account with your old employer.\n• Roll it into your new employer’s 401(k).\n• Move it into an IRA.',
      '10. Why should I contribute to my 401(k)?\nBecause it helps you save for retirement automatically, lowers your taxes (if pre-tax), and often includes employer matching — essentially free money you don’t want to miss.',
    ],
  },
};

const formatCurrency = (amount) =>
  `$${amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

function getBenchmarkCopy(type, value) {
  const list = type === 'percentage' ? percentageBenchmarks : fixedBenchmarks;
  const closest = list.reduce((prev, curr) =>
    Math.abs(curr.value - value) < Math.abs(prev.value - value) ? curr : prev
  );
  return closest.label;
}

function calculateFutureValue(annualContribution, years = 25, rate = 0.05) {
  const contributionPerPeriod = annualContribution / PAY_PERIODS_PER_YEAR;
  const periodRate = rate / PAY_PERIODS_PER_YEAR;
  const totalPeriods = PAY_PERIODS_PER_YEAR * years;
  if (periodRate === 0) {
    return contributionPerPeriod * totalPeriods;
  }
  return (
    contributionPerPeriod *
    ((Math.pow(1 + periodRate, totalPeriods) - 1) / periodRate) *
    (1 + periodRate)
  );
}

function createContributionSeries(perPaycheckGross) {
  const annualSalary = perPaycheckGross * PAY_PERIODS_PER_YEAR;
  const ages = [25, 30, 35, 40, 45, 50, 55, 60, 65];
  const presets = [
    { label: '2% contribution', rate: 0.02, color: '#6FB089' },
    { label: '5% contribution', rate: 0.05, color: '#7B78E5' },
    { label: '10% contribution', rate: 0.1, color: '#1F4D8F' },
  ];

  const series = presets.map((preset) => {
    const annualContribution = annualSalary * preset.rate;
    const values = ages.map((age) => {
      const years = Math.max(age - ages[0], 0);
      if (years === 0) {
        return 0;
      }
      return calculateFutureValue(annualContribution, years, 0.06);
    });
    return {
      ...preset,
      values,
    };
  });

  return { ages, series };
}

function buildAreaPath(values, width, height, maxValue) {
  if (maxValue === 0) {
    return `M 0 ${height} L ${width} ${height}`;
  }
  const xStep = width / (values.length - 1);
  let path = `M 0 ${height}`;
  values.forEach((value, index) => {
    const x = index * xStep;
    const normalized = Math.max(value / maxValue, 0);
    const y = height - normalized * height;
    path += ` L ${x} ${Number.isFinite(y) ? y : height}`;
  });
  path += ` L ${width} ${height} Z`;
  return path;
}

function buildLinePath(values, width, height, maxValue) {
  if (maxValue === 0) {
    return `M 0 ${height}`;
  }
  const xStep = width / (values.length - 1);
  return values
    .map((value, index) => {
      const x = index * xStep;
      const normalized = Math.max(value / maxValue, 0);
      const y = height - normalized * height;
      return `${index === 0 ? 'M' : 'L'} ${x} ${Number.isFinite(y) ? y : height}`;
    })
    .join(' ');
}

export default function App() {
  const [contributionType, setContributionType] = useState('percentage');
  const [percentageValue, setPercentageValue] = useState(4);
  const [fixedValue, setFixedValue] = useState(68);
  const [activePanel, setActivePanel] = useState('overview');
  const [activeWorkflowTab, setActiveWorkflowTab] = useState('type');
  const [showResults, setShowResults] = useState(false);
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  const perPaycheckGross = BASE_SALARY / PAY_PERIODS_PER_YEAR;

  const contributionValue = contributionType === 'percentage' ? percentageValue : fixedValue;

  const preciseEmployeeContributionPerPaycheck =
    contributionType === 'percentage'
      ? (percentageValue / 100) * perPaycheckGross
      : fixedValue;

  const employeeContributionPerPaycheckDisplay = Math.round(preciseEmployeeContributionPerPaycheck);

  const effectivePercentage = useMemo(
    () =>
    contributionType === 'percentage'
        ? percentageValue.toFixed(1)
        : ((fixedValue / perPaycheckGross) * 100).toFixed(1),
    [contributionType, percentageValue, fixedValue, perPaycheckGross]
  );

  const maxEmployerMatchPerPaycheck = perPaycheckGross * EMPLOYER_MATCH_CAP * EMPLOYER_MATCH_RATE;

  const preciseEmployerMatchPerPaycheck = Math.min(
    preciseEmployeeContributionPerPaycheck * EMPLOYER_MATCH_RATE,
    maxEmployerMatchPerPaycheck
  );

  const employerMatchPerPaycheckDisplay = Math.round(preciseEmployerMatchPerPaycheck);

  const ytdEmployeeContributionDisplay = employeeContributionPerPaycheckDisplay * PAYCHECKS_YTD;
  const ytdEmployerMatchDisplay = employerMatchPerPaycheckDisplay * PAYCHECKS_YTD;

  const annualEmployeeContribution = preciseEmployeeContributionPerPaycheck * PAY_PERIODS_PER_YEAR;
  const annualEmployerMatch = preciseEmployerMatchPerPaycheck * PAY_PERIODS_PER_YEAR;
  const projectedFutureValue = useMemo(() => {
    const totalAnnual = annualEmployeeContribution + annualEmployerMatch;
    return calculateFutureValue(totalAnnual);
  }, [annualEmployeeContribution, annualEmployerMatch]);

  const chartData = useMemo(
    () => createContributionSeries(perPaycheckGross),
    [perPaycheckGross]
  );

  const benchmarkCopy = useMemo(
    () => getBenchmarkCopy(contributionType, contributionValue),
    [contributionType, contributionValue]
  );

  const panel = infoPanels[activePanel];

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        <HeaderBar />
        <View style={styles.contextCard}>
          <Text style={styles.contextHeading}>Manage your contributions</Text>
          <Text style={styles.contextSubtitle}>Welcome, User 1!</Text>
          <View style={styles.contextSummary}>
            <Text style={styles.summaryText}>Cleaning Team Lead · Berry Clean</Text>
            <Text style={styles.summaryText}>Annual salary {formatCurrency(BASE_SALARY)} · {PAY_PERIODS_PER_YEAR} pay periods</Text>
          </View>
          <Text style={styles.contextCopy}>
            This planner walks you through setting your contribution style and dialing in the amount that
            fits each paycheck. Once you enter your choices, we’ll surface your year-to-date totals and a
            projection of how those dollars compound toward retirement.
          </Text>
          <View style={styles.infographic}>
            <View style={styles.infographicStep}>
              <View style={[styles.stepBadge, { backgroundColor: '#6FB089' }]}> 
                <Text style={styles.stepBadgeText}>1</Text>
              </View>
              <View style={styles.stepCopy}>
                <Text style={styles.stepTitle}>Set contribution type</Text>
                <Text style={styles.stepDescription}>
                  Choose percentage or fixed dollar and learn how each option responds to your paycheck.
                </Text>
              </View>
            </View>
            <View style={styles.infographicStep}>
              <View style={[styles.stepBadge, { backgroundColor: '#1F4D8F' }]}> 
                <Text style={styles.stepBadgeText}>2</Text>
              </View>
              <View style={styles.stepCopy}>
                <Text style={styles.stepTitle}>Adjust contribution rate</Text>
                <Text style={styles.stepDescription}>
                  Use the slider or input to fine-tune your amount, then compare benchmarks before you lock it in.
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Contribution setup flow</Text>
          <Text style={styles.sectionIntro}>
            Switch between the tabs to define your contribution style and adjust your rate. All inputs
            stay in sync so you can experiment freely before you submit.
          </Text>
          <View style={styles.workflowTabs}>
            <Pressable
              onPress={() => setActiveWorkflowTab('type')}
              style={[
                styles.workflowTab,
                activeWorkflowTab === 'type' && styles.workflowTabActive,
              ]}
            >
              <Text
                style={[
                  styles.workflowTabLabel,
                  activeWorkflowTab === 'type' && styles.workflowTabLabelActive,
                ]}
              >
                Set Contribution Type
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setActiveWorkflowTab('adjust')}
              style={[
                styles.workflowTab,
                activeWorkflowTab === 'adjust' && styles.workflowTabActive,
              ]}
            >
              <Text
                style={[
                  styles.workflowTabLabel,
                  activeWorkflowTab === 'adjust' && styles.workflowTabLabelActive,
                ]}
              >
                Adjust Contribution Rate
              </Text>
            </Pressable>
          </View>
          <View style={styles.workflowContent}>
            {activeWorkflowTab === 'type' ? (
              <View style={styles.typeTab}>
                <Text style={styles.subHeading}>How would you like to contribute?</Text>
                <View style={styles.toggleGroup}>
                  {['percentage', 'fixed'].map((type) => (
                    <Pressable
                      key={type}
                      onPress={() => setContributionType(type)}
                      style={[
                        styles.toggleButton,
                        contributionType === type && styles.toggleButtonActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.toggleLabel,
                          contributionType === type && styles.toggleLabelActive,
                        ]}
                      >
                        {type === 'percentage' ? 'Percent of Paycheck' : 'Fixed $ Per Paycheck'}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <View style={styles.definitionBox}>
                  <Text style={styles.definitionTitle}>
                    {contributionType === 'percentage'
                      ? 'Percentage Contributions'
                      : 'Fixed Dollar Contributions'}
                  </Text>
                  <Text style={styles.definitionCopy}>
                    {contributionType === 'percentage'
                      ? 'Set a percentage and the dollar amount adjusts automatically as your paycheck changes—great for staying aligned with take-home pay.'
                      : 'Pick a dollar amount you are comfortable with. The same amount is invested each paycheck, ideal for predictable budgeting.'}
                  </Text>
                </View>
                <Text style={styles.infoHint}>
                  Tip: explore both options to see how the employer match responds before you commit.
                </Text>
              </View>
            ) : (
              <View style={styles.adjustTab}>
                <Text style={styles.subHeading}>Dial in the amount that fits your paycheck</Text>
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>
                    {contributionType === 'percentage' ? 'Contribution %' : 'Contribution $'}
                  </Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={
                      contributionType === 'percentage'
                        ? percentageValue.toString()
                        : Math.round(fixedValue).toString()
                    }
                    onChangeText={(text) => {
                      const numeric = parseFloat(text.replace(/[^0-9.]/g, '')) || 0;
                      if (contributionType === 'percentage') {
                        const clamped = Math.min(Math.max(numeric, 0), 15);
                        setPercentageValue(Number(clamped.toFixed(1)));
                      } else {
                        const clamped = Math.min(Math.max(numeric, 0), 500);
                        setFixedValue(Math.round(clamped));
                      }
                    }}
                  />
                </View>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={contributionType === 'percentage' ? 15 : 500}
                  minimumTrackTintColor={COLORS.teal}
                  maximumTrackTintColor={COLORS.border}
                  thumbTintColor={COLORS.navy}
                  step={contributionType === 'percentage' ? 0.5 : 5}
                  value={contributionType === 'percentage' ? percentageValue : fixedValue}
                  onValueChange={(value) =>
                    contributionType === 'percentage'
                      ? setPercentageValue(Number(value.toFixed(1)))
                      : setFixedValue(Math.round(value))
                  }
                />
                <View style={styles.quickStats}>
                  <StatPill
                    label="Per paycheck"
                    value={formatCurrency(employeeContributionPerPaycheckDisplay)}
                  />
                  <StatPill
                    label="Employer match"
                    value={formatCurrency(employerMatchPerPaycheckDisplay)}
                  />
                  <StatPill label="Effective %" value={`${effectivePercentage}%`} />
                </View>
                <View style={styles.benchmarkBox}>
                  <Text style={styles.benchmarkLabel}>How this compares</Text>
                  <Text style={styles.benchmarkCopy}>{benchmarkCopy}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        <Pressable
          onPress={() => setShowResults(true)}
          style={[
            styles.enterButton,
            showResults && styles.enterButtonSecondary,
          ]}
        >
          <Text style={styles.enterButtonText}>{showResults ? 'Update results' : 'Enter'}</Text>
        </Pressable>

        {showResults && (
          <>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Your Year-to-Date Snapshot</Text>
          <View style={styles.tableRowHeader}>
            <Text style={styles.tableHeaderCell}>Contribution Type</Text>
            <Text style={styles.tableHeaderCellCenter}>Per Paycheck</Text>
            <Text style={styles.tableHeaderCellRight}>YTD Total</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCellTitle}>Employee Contribution</Text>
            <Text style={styles.tableCellCenter}>
              {formatCurrency(employeeContributionPerPaycheckDisplay)}
            </Text>
            <Text style={styles.tableCellRight}>
              {formatCurrency(ytdEmployeeContributionDisplay)}
            </Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCellTitle}>Employer Match</Text>
            <Text style={styles.tableCellCenter}>
              {formatCurrency(employerMatchPerPaycheckDisplay)}
            </Text>
            <Text style={styles.tableCellRight}>
              {formatCurrency(ytdEmployerMatchDisplay)}
            </Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCellTitle}>Total Saved YTD</Text>
            <Text style={styles.tableCellCenter}>—</Text>
            <Text style={styles.tableCellRight}>
              {formatCurrency(ytdEmployeeContributionDisplay + ytdEmployerMatchDisplay)}
            </Text>
          </View>
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>See how your savings grow with time</Text>
          <Text style={styles.chartSubtitle}>
            Your current election: {effectivePercentage}% | {formatCurrency(employeeContributionPerPaycheckDisplay)} each paycheck
          </Text>
          <ContributionChart data={chartData} />
          <View style={styles.chartLegend}>
            {chartData.series.map((series) => (
              <View key={series.label} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: series.color }]} />
                <Text style={styles.legendLabel}>{series.label}</Text>
              </View>
            ))}
          </View>
          <View style={styles.cartoonCallout}>
            <Text style={styles.cartoonIcon}>🧼</Text>
            <Text style={styles.cartoonCopy}>
              Clean sweep reminder: increasing your contribution even 1% keeps Berry Clean’s match working
              harder for future-you.
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Guide & Impact</Text>
          <View style={styles.panelTabs}>
            {Object.entries(infoPanels).map(([key, value]) => (
              <Pressable
                key={key}
                style={[styles.panelTab, activePanel === key && styles.panelTabActive]}
                onPress={() => setActivePanel(key)}
              >
                <Text style={[styles.panelTabText, activePanel === key && styles.panelTabTextActive]}>
                  {value.title}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.panelBody}>
            <Text style={styles.panelTitle}>{panel.title}</Text>
            {panel.body.map((entry) => (
              <View key={entry} style={styles.panelEntry}>
                {entry.split('\n\n').map((paragraph, idx) => (
                  <Text key={`${entry}-${idx}`} style={styles.panelCopy}>
                    {paragraph}
                  </Text>
                ))}
              </View>
            ))}
          </View>
          <View style={styles.impactBox}>
            <Text style={styles.impactTitle}>Projected nest egg at retirement</Text>
            <Text style={styles.impactValue}>{formatCurrency(Math.round(projectedFutureValue))}</Text>
            <Text style={styles.impactCopy}>
              Assumes steady contributions every paycheck, a blended 5% annual return, and employer match staying in place.
              Use this as a guidepost, not a guarantee.
            </Text>
          </View>
        </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatPill({ label, value }) {
  return (
    <View style={styles.statPill}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function ContributionChart({ data }) {
  if (!data) {
    return null;
  }

  const width = 320;
  const height = 180;
  const maxValue = Math.max(
    ...data.series.flatMap((series) => series.values)
  );

  return (
    <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
      <Line x1={0} y1={height} x2={width} y2={height} stroke="#C8D6EA" strokeWidth={1} />
      <Line x1={0} y1={0} x2={0} y2={height} stroke="#C8D6EA" strokeWidth={1} />
      {data.series.map((series) => (
        <Path
          key={`${series.label}-fill`}
          d={buildAreaPath(series.values, width, height, maxValue)}
          fill={series.color}
          fillOpacity={0.22}
        />
      ))}
      {data.series.map((series) => (
        <Path
          key={series.label}
          d={buildLinePath(series.values, width, height, maxValue)}
          fill="none"
          stroke={series.color}
          strokeWidth={2}
        />
      ))}
    </Svg>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    padding: 24,
    gap: 20,
  },
  card: {
    backgroundColor: '#E9F2FD',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#C8DAF5',
  },
  contextCard: {
    backgroundColor: '#E9F2FD',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#C8DAF5',
    gap: 12,
  },
  contextHeading: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.navy,
    fontFamily: 'Inter_700Bold',
  },
  contextSubtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.teal,
    fontFamily: 'Inter_600SemiBold',
  },
  contextCopy: {
    fontSize: 15,
    color: COLORS.muted,
    lineHeight: 22,
    fontFamily: 'Inter_400Regular',
  },
  infographic: {
    marginTop: 16,
    gap: 12,
  },
  infographicStep: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    backgroundColor: '#F4F9FF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#D9E7F9',
  },
  stepBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
  },
  stepCopy: {
    flex: 1,
    gap: 4,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.navy,
    fontFamily: 'Inter_600SemiBold',
  },
  stepDescription: {
    fontSize: 14,
    color: COLORS.muted,
    lineHeight: 20,
    fontFamily: 'Inter_400Regular',
  },
  contextSummary: {
    marginTop: 8,
    marginBottom: 4,
    gap: 4,
  },
  summaryText: {
    fontSize: 16,
    color: COLORS.navy,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.navy,
    marginBottom: 18,
    fontFamily: 'Inter_700Bold',
  },
  sectionIntro: {
    fontSize: 15,
    color: COLORS.muted,
    lineHeight: 22,
    marginBottom: 18,
    fontFamily: 'Inter_400Regular',
  },
  toggleGroup: {
    flexDirection: 'row',
    backgroundColor: '#E2EEF9',
    borderRadius: 16,
    padding: 4,
    gap: 6,
  },
  workflowTabs: {
    flexDirection: 'row',
    backgroundColor: '#E2EEF9',
    borderRadius: 16,
    padding: 4,
    gap: 8,
    flexWrap: 'wrap',
  },
  workflowTab: {
    flexGrow: 1,
    minWidth: 140,
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  workflowTabActive: {
    backgroundColor: COLORS.teal,
  },
  workflowTabLabel: {
    fontSize: 15,
    color: COLORS.softSlate,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'Inter_600SemiBold',
  },
  workflowTabLabelActive: {
    color: COLORS.white,
  },
  workflowContent: {
    marginTop: 20,
    gap: 16,
  },
  typeTab: {
    gap: 16,
  },
  adjustTab: {
    gap: 16,
  },
  subHeading: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.navy,
    fontFamily: 'Inter_600SemiBold',
  },
  infoHint: {
    fontSize: 14,
    color: COLORS.softSlate,
    fontFamily: 'Inter_500Medium',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: COLORS.teal,
  },
  toggleLabel: {
    color: COLORS.softSlate,
    fontSize: 15,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
  toggleLabelActive: {
    color: COLORS.white,
    fontFamily: 'Inter_600SemiBold',
  },
  definitionBox: {
    marginTop: 16,
    backgroundColor: '#F3F8FE',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  definitionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.navy,
    marginBottom: 8,
    fontFamily: 'Inter_600SemiBold',
  },
  definitionCopy: {
    fontSize: 15,
    color: COLORS.muted,
    lineHeight: 22,
    fontFamily: 'Inter_400Regular',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  inputLabel: {
    fontSize: 16,
    color: COLORS.navy,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  input: {
    flex: 0.4,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: 17,
    color: COLORS.navy,
    fontFamily: 'Inter_500Medium',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  quickStats: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  enterButton: {
    marginTop: -4,
    alignSelf: 'center',
    backgroundColor: COLORS.navy,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 999,
    shadowColor: '#0B1F3B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
  },
  enterButtonSecondary: {
    backgroundColor: COLORS.teal,
  },
  enterButtonText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.2,
    fontFamily: 'Inter_600SemiBold',
  },
  statPill: {
    backgroundColor: '#E4F1FB',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexGrow: 1,
    minWidth: 110,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.softSlate,
    marginBottom: 4,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
  statValue: {
    fontSize: 18,
    color: COLORS.navy,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  benchmarkBox: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F1F6FD',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  benchmarkLabel: {
    fontSize: 14,
    color: COLORS.softSlate,
    marginBottom: 6,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  benchmarkCopy: {
    fontSize: 15,
    color: COLORS.muted,
    lineHeight: 22,
    fontFamily: 'Inter_400Regular',
  },
  tableRowHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 8,
  },
  tableHeaderCell: {
    flex: 1.2,
    color: COLORS.softSlate,
    fontWeight: '600',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  tableHeaderCellCenter: {
    flex: 1,
    textAlign: 'center',
    color: COLORS.softSlate,
    fontWeight: '600',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  tableHeaderCellRight: {
    flex: 1,
    textAlign: 'right',
    color: COLORS.softSlate,
    fontWeight: '600',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E6EEF9',
  },
  tableCellTitle: {
    flex: 1.2,
    fontSize: 15,
    color: COLORS.navy,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  tableCellCenter: {
    flex: 1,
    fontSize: 15,
    color: COLORS.navy,
    textAlign: 'center',
    fontFamily: 'Inter_500Medium',
  },
  tableCellRight: {
    flex: 1,
    fontSize: 15,
    color: COLORS.navy,
    textAlign: 'right',
    fontFamily: 'Inter_500Medium',
  },
  panelTabs: {
    flexDirection: 'row',
    backgroundColor: '#E2EEF9',
    borderRadius: 14,
    padding: 4,
    gap: 6,
    flexWrap: 'wrap',
  },
  panelTab: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelTabActive: {
    backgroundColor: COLORS.teal,
  },
  panelTabText: {
    fontSize: 14,
    color: COLORS.softSlate,
    textAlign: 'center',
    fontFamily: 'Inter_600SemiBold',
  },
  panelTabTextActive: {
    color: COLORS.white,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  panelBody: {
    marginTop: 16,
    gap: 16,
  },
  panelTitle: {
    fontSize: 18,
    color: COLORS.navy,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  panelEntry: {
    gap: 6,
  },
  panelCopy: {
    fontSize: 15,
    color: COLORS.muted,
    lineHeight: 22,
    fontFamily: 'Inter_400Regular',
  },
  chartCard: {
    backgroundColor: '#E9F2FD',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#C8DAF5',
    gap: 18,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.navy,
    fontFamily: 'Inter_600SemiBold',
  },
  chartSubtitle: {
    fontSize: 14,
    color: COLORS.softSlate,
    fontFamily: 'Inter_500Medium',
  },
  chartLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    fontSize: 12,
    color: COLORS.softSlate,
    fontFamily: 'Inter_500Medium',
  },
  cartoonCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#EEF6FF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#D1E2FF',
  },
  cartoonIcon: {
    fontSize: 22,
  },
  cartoonCopy: {
    fontSize: 14,
    color: COLORS.muted,
    lineHeight: 21,
    fontFamily: 'Inter_500Medium',
  },
  impactBox: {
    marginTop: 20,
    backgroundColor: '#F1F8FD',
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  impactTitle: {
    fontSize: 15,
    color: COLORS.softSlate,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  impactValue: {
    fontSize: 26,
    color: COLORS.navy,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  impactCopy: {
    fontSize: 14,
    color: COLORS.softSlate,
    lineHeight: 21,
    fontFamily: 'Inter_400Regular',
  },
  headerBar: {
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerBrand: {
    flex: 1,
    alignItems: 'flex-start',
    gap: 6,
  },
  brandTitle: {
    fontSize: 40,
    color: COLORS.navy,
    fontFamily: 'Inter_800ExtraBold',
  },
  headerBadge: {
    backgroundColor: '#F8FBFF',
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    gap: 10,
    marginLeft: 16,
    alignSelf: 'flex-start',
  },
  badgeIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  badgeCaption: {
    fontSize: 13,
    color: COLORS.softSlate,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontFamily: 'Inter_600SemiBold',
  },
  badgeHighlight: {
    color: COLORS.teal,
    fontFamily: 'Inter_600SemiBold',
  },
  badgeDivider: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.accent,
  },
});

function HeaderBar() {
  return (
    <View style={styles.headerBar}>
      <View style={styles.headerBrand}>
        <Text style={styles.brandTitle}>401(k) Contribution Planner</Text>
      </View>
      <View style={styles.headerBadge}>
        <View style={styles.badgeIconRow}>
          <HiLogoMark />
          <View style={styles.badgeDivider} />
          <BerryLogoMark />
        </View>
        <Text style={styles.badgeCaption}>
          <Text style={styles.badgeHighlight}>Human Interest</Text> × Berry Clean
        </Text>
      </View>
    </View>
  );
}

function HiLogoMark({ size = 44 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Path
        d="M18 10h12v18c4.2-5 9.7-7.5 16.4-7.5 9.6 0 16.6 5.8 16.6 16.7V54H51V39.7c0-6.1-2.9-8.8-7.7-8.8-5.4 0-9.7 3.5-11.3 8.4V54H18V10z"
        fill={COLORS.navy}
      />
      <Circle cx={48} cy={12} r={6.5} fill={COLORS.teal} />
    </Svg>
  );
}

function BerryLogoMark({ size = 48 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Circle cx={32} cy={32} r={30} fill="#F5F7FA" stroke="#C9CDD6" strokeWidth={2} />
      <Circle cx={32} cy={18} r={6} fill="#D94F5C" />
      <Path
        d="M32 24c-8 0-14 6-14 14 0 8 6 14 14 14s14-6 14-14c0-8-6-14-14-14zm0 22c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z"
        fill="#D94F5C"
      />
      <Circle cx={20} cy={34} r={7} fill="#E35763" />
      <Circle cx={44} cy={34} r={7} fill="#E35763" />
      <Circle cx={32} cy={32} r={4} fill="#F5F7FA" />
      <Circle cx={32} cy={12} r={2} fill="#E35763" />
    </Svg>
  );
}

