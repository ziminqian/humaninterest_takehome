import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  useWindowDimensions,
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
import {
  BarChart3,
  Calculator,
  DollarSign,
  HelpCircle,
  Info,
  Lightbulb,
  Percent,
  PiggyBank,
  Target,
  TrendingUp,
  LucideIcon,
} from 'lucide-react-native';

import { ImageWithFallback } from './components/figma/ImageWithFallback';

const COLORS = {
  background: '#F6FAFF',
  teal: '#54B3AB',
  navy: '#0E294B',
  accent: '#F0C377',
  white: '#FFFFFF',
  softSlate: '#58738F',
  border: '#C8DAF5',
  muted: '#627A93',
};

const BASE_SALARY = 44000;
const PAY_PERIODS_PER_YEAR = 26;
const PAYCHECKS_YTD = 16;
const EMPLOYER_MATCH_RATE = 0.5;
const EMPLOYER_MATCH_CAP = 0.04;

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1508387029545-590c17813822?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080';

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

type InfoPanelKey = 'overview' | 'insights' | 'impact' | 'faq';

type InfoPanel = {
  title: string;
  icon: LucideIcon;
  body: string[];
};

const infoPanels: Record<InfoPanelKey, InfoPanel> = {
  overview: {
    title: 'Why Contributions Matter',
    icon: Info,
    body: [
      'Your 401(k) contribution is taken out before taxes, letting you invest more of each paycheck.',
      'Berry Clean matches 50% of what you put in, up to 4%. Free money helps you hit your goals faster.',
    ],
  },
  insights: {
    title: 'Average Employee Choices',
    icon: Lightbulb,
    body: [
      'Most cleaning team leads at similar companies stay between 3% and 6%.',
      'Employees who automate increases by 1% a year reach retirement goals 7 years sooner on average.',
    ],
  },
  impact: {
    title: 'Long-Term Impact',
    icon: TrendingUp,
    body: [
      'Consistent contributions, even small ones, compound over decades.',
      'Matching dollars invested earlier have more time to grow—stick with it through market ups and downs.',
    ],
  },
  faq: {
    title: 'FAQ',
    icon: HelpCircle,
    body: [
      '1. What are 401(k) contributions?\n401(k) contributions are the amounts of money that you (the employee) and sometimes your employer set aside for your retirement. They are usually taken automatically from each paycheck and invested in funds like stocks and bonds.',
      '2. How do I contribute to my 401(k)?\nYou can choose to contribute either a percentage of your paycheck (for example, 6%) or a fixed dollar amount (like $200 per pay period). These contributions are automatically deducted from your salary before you get paid.',
      '3. What is the difference between Traditional and Roth 401(k) contributions?\nTraditional 401(k): Contributions are made before taxes, lowering your taxable income now. You will pay taxes when you withdraw the money in retirement.\n\nRoth 401(k): Contributions are made after taxes, so your withdrawals in retirement are tax-free.',
      '4. Does my employer contribute too?\nMany employers offer matching contributions, meaning they will add extra money to your account based on what you contribute.\n\nExample:\n"We match 50% of the first 6% you contribute."\nIf you earn $60,000 and contribute 6% ($3,600), your employer adds another $1,800 — free money toward your retirement.',
      '5. How much can I contribute each year?\nThe IRS sets annual contribution limits. For 2025:\n• Up to $23,000 if you are under 50.\n• Up to $30,500 if you are 50 or older (includes $7,500 catch-up contribution).',
      '6. Where does my contribution go?\nYour money is invested in the options you select (like mutual funds or target-date funds). Over time, these investments can grow and compound to build your retirement savings.',
      '7. What does "vesting" mean?\nVesting determines how much of your employer contributions you actually own.\n\n• Your contributions are always 100% yours.\n• Employer contributions may vest over time (e.g., 20% per year for five years). If you leave the company before you are fully vested, you might forfeit some of the employer match.',
      '8. Can I change my contribution amount later?\nYes! Most plans let you adjust your contribution rate anytime — for example, increasing it from 5% to 6% as your salary grows. Even a small increase can make a big difference over time.',
      '9. What happens if I leave my job?\nYour contributions (and vested employer contributions) stay yours. You can usually:\n• Leave your account with your old employer.\n• Roll it into your new employer 401(k).\n• Move it into an IRA.',
      '10. Why should I contribute to my 401(k)?\nBecause it helps you save for retirement automatically, lowers your taxes (if pre-tax), and often includes employer matching — essentially free money you do not want to miss.',
    ],
  },
};

const formatCurrency = (amount: number) =>
  `$${amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

function getBenchmarkCopy(type: string, value: number) {
  const list = type === 'percentage' ? percentageBenchmarks : fixedBenchmarks;
  const closest = list.reduce((prev, curr) =>
    Math.abs(curr.value - value) < Math.abs(prev.value - value) ? curr : prev
  );
  return closest.label;
}

function calculateFutureValue(annualContribution: number, years = 25, rate = 0.05) {
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

type ChartSeries = {
  label: string;
  rate: number;
  color: string;
  values: number[];
};

type ChartData = {
  ages: number[];
  series: ChartSeries[];
};

function createContributionSeries(perPaycheckGross: number): ChartData {
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

function buildAreaPath(values: number[], width: number, height: number, maxValue: number) {
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

function buildLinePath(values: number[], width: number, height: number, maxValue: number) {
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

const App: React.FC = () => {
  const [contributionType, setContributionType] = useState<'percentage' | 'fixed'>('percentage');
  const [percentageValue, setPercentageValue] = useState(4);
  const [fixedValue, setFixedValue] = useState(68);
  const [activePanel, setActivePanel] = useState<InfoPanelKey>('overview');
  const [activeWorkflowTab, setActiveWorkflowTab] = useState<'type' | 'adjust'>('type');
  const [hasCompletedTypeSelection, setHasCompletedTypeSelection] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });
  const { width: windowWidth } = useWindowDimensions();

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

  const benchmarkCopy = useMemo(
    () => getBenchmarkCopy(contributionType, contributionValue),
    [contributionType, contributionValue]
  );

  const chartData = useMemo(
    () => createContributionSeries(perPaycheckGross),
    [perPaycheckGross]
  );

  const chartWidth = Math.min(windowWidth - 96, 520);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        <HeaderBar />

        <View style={[styles.heroCard, styles.sectionSpacing]}>
          <View style={styles.heroContent}>
            <View style={styles.heroBadgeRow}>
              <View style={styles.heroBadgeIcon}>
                <Calculator color={COLORS.white} size={28} />
              </View>
              <Text style={styles.heroTitle}>Manage your contributions</Text>
            </View>
            <View style={styles.heroSummary}>
              <Text style={styles.heroSummaryText}>Cleaning Team Lead · Berry Clean</Text>
              <Text style={styles.heroSummaryText}>
                Annual salary {formatCurrency(BASE_SALARY)} · {PAY_PERIODS_PER_YEAR} pay periods
              </Text>
            </View>
            <Text style={styles.heroCopy}>
              This planner walks you through setting your contribution style and dialing in the amount that fits
              each paycheck. Once you enter your choices, we surface your year-to-date totals and a projection of how
              those dollars compound toward retirement.
            </Text>
          </View>
        </View>

        <View style={[styles.workflowGuideCard, styles.sectionSpacing]}>
          <View style={styles.workflowIntroHeader}>
            <Text style={styles.sectionTitle}>How it works</Text>
            <Text style={styles.sectionCopy}>
              Two quick steps: decide your contribution style, then fine-tune the amount that fits your paycheck. You can
              revisit these anytime as your goals evolve.
            </Text>
          </View>
          <View style={styles.infographicRow}>
            <View style={[styles.infographicCard, styles.infographicCardFirst]}>
              <View style={[styles.infographicIcon, { backgroundColor: COLORS.teal }]}> 
                <Percent color={COLORS.white} size={28} />
              </View>
              <Text style={styles.infographicTitle}>Set contribution type</Text>
              <Text style={styles.infographicCopy}>
                Choose percentage or fixed dollars and understand how the amount flexes with each paycheck.
              </Text>
            </View>
            <View style={styles.infographicCard}>
              <View style={[styles.infographicIcon, { backgroundColor: COLORS.accent }]}> 
                <Target color={COLORS.navy} size={28} />
              </View>
              <Text style={styles.infographicTitle}>Adjust contribution rate</Text>
              <Text style={styles.infographicCopy}>
                Use the slider or input to target the number that meets your savings comfort zone.
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.workflowCard, styles.sectionSpacing]}>
          <Text style={styles.sectionTitle}>Contribution setup flow</Text>
          <Text style={styles.sectionCopy}>
            Switch between the tabs to define your contribution style and adjust your rate. All inputs stay in sync so
            you can experiment freely before you submit.
          </Text>

          <View style={styles.workflowTabs}>
            <Pressable
              onPress={() => setActiveWorkflowTab('type')}
              style={({ pressed }) => [
                styles.workflowTab,
                activeWorkflowTab === 'type' && styles.workflowTabActive,
                pressed && styles.workflowTabPressed,
              ]}
            >
              <View style={styles.workflowTabContent}>
                <View
                  style={[
                    styles.workflowStepBadge,
                    { backgroundColor: activeWorkflowTab === 'type' ? COLORS.white : COLORS.teal },
                  ]}
                >
                  <Text
                    style={[
                      styles.workflowStepText,
                      { color: activeWorkflowTab === 'type' ? COLORS.teal : COLORS.white },
                    ]}
                  >
                    1
                  </Text>
                </View>
                <Text
                  style={[
                    styles.workflowTabLabel,
                    activeWorkflowTab === 'type' && styles.workflowTabLabelActive,
                  ]}
                >
                  Set Contribution Type
                </Text>
              </View>
            </Pressable>

            <Pressable
              disabled={!hasCompletedTypeSelection}
              onPress={() => setActiveWorkflowTab('adjust')}
              style={({ pressed }) => [
                styles.workflowTab,
                activeWorkflowTab === 'adjust' && styles.workflowTabActive,
                pressed && styles.workflowTabPressed,
                !hasCompletedTypeSelection && styles.workflowTabDisabled,
              ]}
            >
              <View style={styles.workflowTabContent}>
                <View
                  style={[
                    styles.workflowStepBadge,
                    {
                      backgroundColor:
                        activeWorkflowTab === 'adjust' ? COLORS.white : hasCompletedTypeSelection ? COLORS.teal : '#9BA7BA',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.workflowStepText,
                      {
                        color:
                          activeWorkflowTab === 'adjust'
                            ? COLORS.teal
                            : hasCompletedTypeSelection
                            ? COLORS.white
                            : COLORS.white,
                      },
                    ]}
                  >
                    2
                  </Text>
                </View>
                <Text
                  style={[
                    styles.workflowTabLabel,
                    activeWorkflowTab === 'adjust' && styles.workflowTabLabelActive,
                  ]}
                >
                  Adjust Contribution Rate
                </Text>
              </View>
            </Pressable>
          </View>

          {activeWorkflowTab === 'type' ? (
            <View style={styles.typeTab}>
              <Text style={styles.subHeading}>How would you like to contribute?</Text>
              <View style={styles.toggleGroup}>
                {['percentage', 'fixed'].map((type) => (
                  <Pressable
                    key={type}
                    onPress={() => setContributionType(type as 'percentage' | 'fixed')}
                    style={({ pressed }) => [
                      styles.toggleButton,
                      contributionType === type && styles.toggleButtonActive,
                      pressed && styles.toggleButtonPressed,
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
                <View style={styles.definitionHeader}>
                  {contributionType === 'percentage' ? (
                    <Percent color={COLORS.teal} size={24} />
                  ) : (
                    <DollarSign color={COLORS.teal} size={24} />
                  )}
                  <Text style={styles.definitionTitle}>
                    {contributionType === 'percentage'
                      ? 'Percentage Contributions'
                      : 'Fixed Dollar Contributions'}
                  </Text>
                </View>
                <Text style={styles.definitionCopy}>
                  {contributionType === 'percentage'
                    ? 'Set a percentage and the dollar amount adjusts automatically as your paycheck changes—great for staying aligned with take-home pay.'
                    : 'Pick a dollar amount you are comfortable with. The same amount is invested each paycheck, ideal for predictable budgeting.'}
                </Text>
              </View>
              <Text style={styles.infoHint}>
                Tip: explore both options to see how the employer match responds before you commit.
              </Text>
              <Pressable
                onPress={() => {
                  setHasCompletedTypeSelection(true);
                  setActiveWorkflowTab('adjust');
                }}
                style={({ pressed }) => [styles.continueButton, pressed && styles.continueButtonPressed]}
              >
                <Text style={styles.continueButtonText}>Continue to Adjust Rate</Text>
              </Pressable>
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

        <Pressable
          onPress={() => setShowResults(true)}
          style={({ pressed }) => [
            styles.enterButton,
            showResults && styles.enterButtonSecondary,
            pressed && styles.enterButtonPressed,
          ]}
        >
          <Text style={styles.enterButtonText}>{showResults ? 'Update results' : 'Enter'}</Text>
        </Pressable>

        {showResults && (
          <>
            <View style={[styles.resultsCard, styles.sectionSpacing]}>
              <View style={styles.resultsHeader}>
                <View style={styles.resultsIconWrapper}>
                  <BarChart3 color={COLORS.white} size={20} />
                </View>
                <Text style={styles.sectionTitle}>Your Year-to-Date Snapshot</Text>
              </View>
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.tableHeaderCell, styles.tableHeaderCellLeft]}>Contribution Type</Text>
                <Text style={[styles.tableHeaderCell, styles.tableHeaderCellCenter]}>Per Paycheck</Text>
                <Text style={[styles.tableHeaderCell, styles.tableHeaderCellRight]}>YTD Total</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={[styles.tableCellTitle, styles.tableCellLeft]}>Employee Contribution</Text>
                <Text style={[styles.tableCellValue, styles.tableCellCenter]}>
                  {formatCurrency(employeeContributionPerPaycheckDisplay)}
                </Text>
                <Text style={[styles.tableCellValue, styles.tableCellRight]}>
                  {formatCurrency(ytdEmployeeContributionDisplay)}
                </Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={[styles.tableCellTitle, styles.tableCellLeft]}>Employer Match</Text>
                <Text style={[styles.tableCellValue, styles.tableCellCenter]}>
                  {formatCurrency(employerMatchPerPaycheckDisplay)}
                </Text>
                <Text style={[styles.tableCellValue, styles.tableCellRight]}>
                  {formatCurrency(ytdEmployerMatchDisplay)}
                </Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={[styles.tableCellTitle, styles.tableCellLeft]}>Total Saved YTD</Text>
                <Text style={[styles.tableCellValue, styles.tableCellCenter]}>—</Text>
                <Text style={[styles.tableCellValue, styles.tableCellRight]}>
                  {formatCurrency(ytdEmployeeContributionDisplay + ytdEmployerMatchDisplay)}
                </Text>
              </View>
            </View>

            <View style={[styles.chartCard, styles.sectionSpacing]}>
              <Text style={styles.sectionTitle}>See how your savings grow with time</Text>
              <Text style={styles.chartSubtitle}>
                Your current election: {effectivePercentage}% · {formatCurrency(employeeContributionPerPaycheckDisplay)} per paycheck
              </Text>
              <View style={styles.chartSvgContainer}>
                <ContributionChart data={chartData} width={chartWidth} />
              </View>
              <View style={styles.chartLegend}>
                {chartData.series.map((series) => (
                  <View key={series.label} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: series.color }]} />
                    <Text style={styles.legendLabel}>{series.label}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.comparisonList}>
                {[0, 1, 2, 3].map((increase) => {
                  const newPercentage = parseFloat(effectivePercentage) + increase;
                  const newAnnualContribution = (newPercentage / 100) * BASE_SALARY;
                  const newEmployerMatch = Math.min(
                    newAnnualContribution * EMPLOYER_MATCH_RATE,
                    BASE_SALARY * EMPLOYER_MATCH_CAP * EMPLOYER_MATCH_RATE
                  );
                  const totalAnnual = newAnnualContribution + newEmployerMatch;
                  const futureValue = calculateFutureValue(totalAnnual);

                  return (
                    <View
                      key={increase}
                      style={[styles.comparisonRow, increase === 0 && styles.comparisonRowHighlighted]}
                    >
                      <View>
                        <Text style={styles.comparisonLabel}>{newPercentage.toFixed(1)}% election</Text>
                        <Text style={styles.comparisonSubLabel}>
                          {formatCurrency(Math.round(newAnnualContribution / PAY_PERIODS_PER_YEAR))} per paycheck
                        </Text>
                      </View>
                      <Text style={styles.comparisonValue}>{formatCurrency(Math.round(futureValue))}</Text>
                    </View>
                  );
                })}
              </View>
              <View style={styles.cartoonCallout}>
                <Text style={styles.cartoonIcon}>🧼</Text>
                <Text style={styles.cartoonCopy}>
                  Clean sweep reminder: increasing your contribution even 1% keeps Berry Clean’s match working harder for future-you.
                </Text>
              </View>
            </View>

            <View style={[styles.guideCard, styles.sectionSpacing]}>
              <Text style={styles.sectionTitle}>Guide & Impact</Text>
              <View style={styles.panelTabs}>
                {(Object.keys(infoPanels) as InfoPanelKey[]).map((key) => {
                  const panelInfo = infoPanels[key];
                  return (
                    <Pressable
                      key={key}
                      onPress={() => setActivePanel(key)}
                      style={({ pressed }) => [
                        styles.panelTab,
                        activePanel === key && styles.panelTabActive,
                        pressed && styles.panelTabPressed,
                      ]}
                    >
                      <View style={styles.panelTabContent}>
                        <panelInfo.icon
                          size={18}
                          color={activePanel === key ? COLORS.white : COLORS.teal}
                        />
                        <Text
                          style={[styles.panelTabText, activePanel === key && styles.panelTabTextActive]}
                        >
                          {panelInfo.title}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
              <View style={styles.panelBody}>
                <Text style={styles.panelTitle}>{infoPanels[activePanel].title}</Text>
                {infoPanels[activePanel].body.map((entry, index) => (
                  <View key={entry} style={styles.panelEntry}>
                    {entry.split('\n\n').map((paragraph) => (
                      <Text key={`${entry}-${paragraph}`} style={styles.panelCopy}>
                        {paragraph}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
              <View style={styles.impactBox}>
                <View style={styles.impactHeader}>
                  <PiggyBank color={COLORS.accent} size={26} />
                  <Text style={styles.impactTitle}>Projected nest egg at retirement</Text>
                </View>
                <Text style={styles.impactValue}>{formatCurrency(Math.round(projectedFutureValue))}</Text>
                <Text style={styles.impactCopy}>
                  Assumes steady contributions every paycheck, a blended 5% annual return, and employer match staying in place. Use this as a guidepost, not a guarantee.
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

type StatPillProps = {
  label: string;
  value: string;
};

const StatPill: React.FC<StatPillProps> = ({ label, value }) => (
  <View style={styles.statPill}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

type ChartProps = {
  data: ChartData;
  width: number;
};

const ContributionChart: React.FC<ChartProps> = ({ data, width }) => {
  const height = 200;
  const maxValue = Math.max(...data.series.flatMap((series) => series.values));

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
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
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    paddingHorizontal: 24,
    paddingBottom: 36,
    paddingTop: 0,
  },
  sectionSpacing: {
    marginBottom: 24,
  },
  headerRow: {
    marginBottom: 12,
  },
  heroCard: {
    backgroundColor: '#E9F2FD',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  heroContent: {
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 12,
    gap: 12,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroBadgeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 26,
    fontFamily: 'Inter_700Bold',
    color: COLORS.navy,
  },
  heroSummary: {
    gap: 2,
  },
  heroSummaryText: {
    fontSize: 15,
    color: COLORS.navy,
    fontFamily: 'Inter_600SemiBold',
  },
  headerWelcomeText: {
    fontSize: 20,
    color: COLORS.teal,
    fontFamily: 'Inter_700Bold',
  },
  heroCopy: {
    fontSize: 15,
    color: COLORS.muted,
    lineHeight: 22,
    fontFamily: 'Inter_400Regular',
  },
  workflowGuideCard: {
    backgroundColor: '#E9F2FD',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 24,
  },
  workflowIntroHeader: {
    marginBottom: 16,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    color: COLORS.navy,
  },
  sectionCopy: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: COLORS.muted,
    lineHeight: 22,
  },
  infographicRow: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  infographicCard: {
    flex: 1,
    minWidth: 160,
    backgroundColor: '#F4F9FF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#D9E7F9',
    gap: 12,
  },
  infographicCardFirst: {
    borderColor: COLORS.teal,
  },
  infographicIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infographicTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: COLORS.navy,
  },
  infographicCopy: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: COLORS.muted,
    lineHeight: 21,
  },
  workflowCard: {
    backgroundColor: '#E9F2FD',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 24,
    gap: 18,
  },
  workflowTabs: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  workflowTab: {
    flex: 1,
    minWidth: 160,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D4E3F4',
    backgroundColor: COLORS.white,
  },
  workflowTabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 14,
  },
  workflowTabActive: {
    backgroundColor: COLORS.teal,
    borderColor: COLORS.teal,
  },
  workflowTabPressed: {
    opacity: 0.9,
  },
  workflowTabDisabled: {
    opacity: 0.45,
  },
  workflowStepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workflowStepText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  workflowTabLabel: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: COLORS.softSlate,
  },
  workflowTabLabelActive: {
    color: COLORS.white,
  },
  typeTab: {
    gap: 16,
  },
  adjustTab: {
    gap: 16,
  },
  subHeading: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: COLORS.navy,
  },
  toggleGroup: {
    flexDirection: 'row',
    backgroundColor: '#E2EEF9',
    borderRadius: 16,
    padding: 4,
    gap: 6,
  },
  toggleButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: COLORS.teal,
  },
  toggleButtonPressed: {
    opacity: 0.9,
  },
  toggleLabel: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    color: COLORS.softSlate,
  },
  toggleLabelActive: {
    color: COLORS.white,
  },
  definitionBox: {
    backgroundColor: '#F3F8FE',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  definitionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  definitionTitle: {
    fontSize: 17,
    fontFamily: 'Inter_600SemiBold',
    color: COLORS.navy,
  },
  definitionCopy: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: COLORS.muted,
    lineHeight: 22,
  },
  infoHint: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: COLORS.softSlate,
  },
  continueButton: {
    marginTop: 8,
    backgroundColor: COLORS.teal,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  continueButtonPressed: {
    opacity: 0.9,
  },
  continueButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: COLORS.navy,
  },
  input: {
    flex: 0.4,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: 17,
    fontFamily: 'Inter_500Medium',
    color: COLORS.navy,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  quickStats: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  statPill: {
    flex: 1,
    minWidth: 120,
    backgroundColor: '#E4F1FB',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  statLabel: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: COLORS.softSlate,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: COLORS.navy,
  },
  benchmarkBox: {
    backgroundColor: '#F1F6FD',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  benchmarkLabel: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: COLORS.softSlate,
  },
  benchmarkCopy: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: COLORS.muted,
    lineHeight: 22,
  },
  enterButton: {
    alignSelf: 'center',
    backgroundColor: COLORS.navy,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 999,
    shadowColor: '#0B1F3B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 24,
  },
  enterButtonSecondary: {
    backgroundColor: COLORS.teal,
  },
  enterButtonPressed: {
    opacity: 0.9,
  },
  enterButtonText: {
    color: COLORS.white,
    fontSize: 17,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.3,
  },
  resultsCard: {
    backgroundColor: '#E9F2FD',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 24,
    gap: 12,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  resultsIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    paddingBottom: 8,
    marginTop: 6,
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: COLORS.softSlate,
  },
  tableHeaderCellLeft: {
    flex: 1.2,
  },
  tableHeaderCellCenter: {
    textAlign: 'center',
  },
  tableHeaderCellRight: {
    textAlign: 'right',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#E6EEF9',
    paddingVertical: 12,
  },
  tableCellTitle: {
    flex: 1.2,
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: COLORS.navy,
  },
  tableCellValue: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    color: COLORS.navy,
  },
  tableCellLeft: {
    paddingRight: 8,
  },
  tableCellCenter: {
    textAlign: 'center',
  },
  tableCellRight: {
    textAlign: 'right',
  },
  chartSvgContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 12,
  },
  chartLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
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
    fontFamily: 'Inter_500Medium',
    color: COLORS.softSlate,
  },
  comparisonList: {
    marginTop: 18,
    gap: 10,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#D7E4F7',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
  },
  comparisonRowHighlighted: {
    borderColor: COLORS.teal,
    backgroundColor: '#E8F4F3',
  },
  comparisonLabel: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: COLORS.navy,
  },
  comparisonSubLabel: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: COLORS.softSlate,
  },
  comparisonValue: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: COLORS.navy,
  },
  cartoonCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
    backgroundColor: '#EEF6FF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#D1E2FF',
  },
  cartoonIcon: {
    fontSize: 22,
  },
  cartoonCopy: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: COLORS.muted,
    lineHeight: 21,
  },
  guideCard: {
    backgroundColor: '#E9F2FD',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 24,
    gap: 18,
  },
  panelTabs: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  panelTab: {
    flex: 1,
    minWidth: 140,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D4E3F4',
    backgroundColor: COLORS.white,
  },
  panelTabPressed: {
    opacity: 0.9,
  },
  panelTabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  panelTabActive: {
    backgroundColor: COLORS.teal,
    borderColor: COLORS.teal,
  },
  panelTabText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: COLORS.softSlate,
  },
  panelTabTextActive: {
    color: COLORS.white,
  },
  panelBody: {
    gap: 12,
  },
  panelTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: COLORS.navy,
  },
  panelEntry: {
    gap: 6,
  },
  panelCopy: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: COLORS.muted,
    lineHeight: 22,
  },
  impactBox: {
    marginTop: 10,
    backgroundColor: '#F1F8FD',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  impactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  impactTitle: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: COLORS.softSlate,
  },
  impactValue: {
    fontSize: 26,
    fontFamily: 'Inter_700Bold',
    color: COLORS.navy,
  },
  impactCopy: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: COLORS.softSlate,
    lineHeight: 21,
  },
  headerBar: {
    marginBottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  headerBrand: {
    flex: 1,
    gap: 6,
  },
  brandTitle: {
    fontSize: 40,
    fontFamily: 'Inter_800ExtraBold',
    color: COLORS.navy,
  },
  heroSummaryRow: {
    marginTop: 0,
  },
  headerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F8FBFF',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  badgeIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  badgeCaption: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: COLORS.softSlate,
  },
  badgeHighlight: {
    color: COLORS.teal,
  },
  badgeDivider: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.accent,
  },
});

const HeaderBar: React.FC = () => (
  <View style={styles.headerBar}>
    <View style={styles.headerBrand}>
      <Text style={styles.brandTitle}>401(k) Contribution Planner</Text>
      <View style={styles.heroSummaryRow}>
        <Text style={styles.headerWelcomeText}>Welcome, User 1!</Text>
      </View>
    </View>
    <View style={styles.headerBadge}>
      <View style={styles.badgeIconRow}>
        <HiLogoMark size={44} />
        <View style={styles.badgeDivider} />
        <BerryLogoMark size={48} />
      </View>
      <Text style={styles.badgeCaption}>
        <Text style={styles.badgeHighlight}>Human Interest</Text> × Berry Clean
      </Text>
    </View>
  </View>
);

type LogoProps = {
  size?: number;
};

const HiLogoMark: React.FC<LogoProps> = ({ size = 44 }) => (
  <Svg width={size} height={size} viewBox="0 0 64 64">
    <Path
      d="M18 10h12v18c4.2-5 9.7-7.5 16.4-7.5 9.6 0 16.6 5.8 16.6 16.7V54H51V39.7c0-6.1-2.9-8.8-7.7-8.8-5.4 0-9.7 3.5-11.3 8.4V54H18V10z"
      fill={COLORS.navy}
    />
    <Circle cx={48} cy={12} r={6.5} fill={COLORS.teal} />
  </Svg>
);

const BerryLogoMark: React.FC<LogoProps> = ({ size = 48 }) => (
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

export default App;

