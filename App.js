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

export default function App() {
  const [contributionType, setContributionType] = useState('percentage');
  const [percentageValue, setPercentageValue] = useState(4);
  const [fixedValue, setFixedValue] = useState(68);
  const [activePanel, setActivePanel] = useState('overview');

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

  const panel = infoPanels[activePanel];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        <HeaderBar />
        <Text style={styles.title}>Human Interest x Berry Clean</Text>
        <View style={styles.card}>
          <LogoBadge />
          <View style={styles.companyMeta}>
            <Text style={styles.metaHeading}>Cleaning Team Lead • Annual Salary {formatCurrency(BASE_SALARY)}</Text>
            <Text style={styles.metaCopy}>
              Pay schedule: bi-weekly ({PAY_PERIODS_PER_YEAR} pay periods/year). Owner: Stanley Chen.
              Human Interest partners with Berry Clean to help each teammate invest with confidence.
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Choose Your Contribution Style</Text>
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
              {contributionType === 'percentage' ? 'Percentage Contributions' : 'Fixed Dollar Contributions'}
            </Text>
            <Text style={styles.definitionCopy}>
              {contributionType === 'percentage'
                ? 'Set a percentage and the dollar amount adjusts automatically as your paycheck changes—great for staying aligned with take-home pay.'
                : 'Pick a dollar amount you are comfortable with. The same amount is invested each paycheck, ideal for predictable budgeting.'}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Adjust Your Contribution</Text>
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
            {panel.body.map((line, index) => (
              <Text key={line} style={styles.panelCopy}>
                {index + 1}. {line}
              </Text>
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
      </ScrollView>
    </SafeAreaView>
  );
}

function LogoBadge() {
  return (
    <View style={styles.logoContainer}>
      <View style={styles.logoMark}>
        <Text style={styles.logoInitials}>BC</Text>
      </View>
      <View>
        <Text style={styles.logoName}>Berry Clean</Text>
        <Text style={styles.logoTagline}>Residential & small-office cleaning services</Text>
      </View>
    </View>
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    padding: 24,
    gap: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.navy,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 20,
    shadowColor: '#0B1F3B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  companyMeta: {
    marginTop: 16,
    gap: 8,
  },
  metaHeading: {
    fontSize: 15,
    color: COLORS.navy,
    fontWeight: '600',
  },
  metaCopy: {
    fontSize: 14,
    color: COLORS.muted,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.navy,
    marginBottom: 16,
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
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: COLORS.teal,
  },
  toggleLabel: {
    color: COLORS.softSlate,
    fontSize: 14,
    fontWeight: '500',
  },
  toggleLabelActive: {
    color: COLORS.white,
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
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.navy,
    marginBottom: 8,
  },
  definitionCopy: {
    fontSize: 14,
    color: COLORS.muted,
    lineHeight: 20,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  inputLabel: {
    fontSize: 15,
    color: COLORS.navy,
    fontWeight: '600',
  },
  input: {
    flex: 0.4,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: 16,
    color: COLORS.navy,
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
  statPill: {
    backgroundColor: '#E4F1FB',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexGrow: 1,
    minWidth: 110,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.softSlate,
    marginBottom: 4,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 16,
    color: COLORS.navy,
    fontWeight: '600',
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
    fontSize: 13,
    color: COLORS.softSlate,
    marginBottom: 6,
    fontWeight: '600',
  },
  benchmarkCopy: {
    fontSize: 14,
    color: COLORS.muted,
    lineHeight: 20,
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
    fontSize: 13,
  },
  tableHeaderCellCenter: {
    flex: 1,
    textAlign: 'center',
    color: COLORS.softSlate,
    fontWeight: '600',
    fontSize: 13,
  },
  tableHeaderCellRight: {
    flex: 1,
    textAlign: 'right',
    color: COLORS.softSlate,
    fontWeight: '600',
    fontSize: 13,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E6EEF9',
  },
  tableCellTitle: {
    flex: 1.2,
    fontSize: 14,
    color: COLORS.navy,
    fontWeight: '500',
  },
  tableCellCenter: {
    flex: 1,
    fontSize: 14,
    color: COLORS.navy,
    textAlign: 'center',
  },
  tableCellRight: {
    flex: 1,
    fontSize: 14,
    color: COLORS.navy,
    textAlign: 'right',
  },
  panelTabs: {
    flexDirection: 'row',
    backgroundColor: '#E2EEF9',
    borderRadius: 14,
    padding: 4,
    gap: 6,
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
    fontSize: 13,
    color: COLORS.softSlate,
    textAlign: 'center',
  },
  panelTabTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  panelBody: {
    marginTop: 16,
    gap: 10,
  },
  panelTitle: {
    fontSize: 16,
    color: COLORS.navy,
    fontWeight: '600',
  },
  panelCopy: {
    fontSize: 14,
    color: COLORS.muted,
    lineHeight: 20,
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
    fontSize: 14,
    color: COLORS.softSlate,
    fontWeight: '600',
  },
  impactValue: {
    fontSize: 24,
    color: COLORS.navy,
    fontWeight: '700',
  },
  impactCopy: {
    fontSize: 13,
    color: COLORS.softSlate,
    lineHeight: 19,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  logoMark: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: COLORS.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInitials: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 1,
  },
  logoName: {
    fontSize: 18,
    color: COLORS.navy,
    fontWeight: '700',
  },
  logoTagline: {
    fontSize: 13,
    color: COLORS.muted,
  },
  headerBar: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#0B1F3B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerTexts: {
    maxWidth: '70%',
    gap: 6,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.navy,
  },
  headerSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.teal,
  },
  headerBadge: {
    backgroundColor: '#F8FBFF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    gap: 8,
  },
  badgeIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  hiLogo: {
    width: 24,
    height: 32,
    borderRadius: 6,
    backgroundColor: COLORS.navy,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  hiLogoStem: {
    width: 12,
    height: 24,
    borderRadius: 6,
    backgroundColor: COLORS.white,
    marginBottom: 2,
  },
  hiLogoDot: {
    position: 'absolute',
    top: -6,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.teal,
  },
  berryLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F9E4E4',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  berryPetal: {
    position: 'absolute',
    width: 12,
    height: 14,
    borderRadius: 6,
    backgroundColor: '#D94F5C',
  },
  berryPetalLeft: {
    transform: [{ translateX: -7 }, { rotate: '-15deg' }],
  },
  berryPetalRight: {
    transform: [{ translateX: 7 }, { rotate: '15deg' }],
  },
  berryPetalBottom: {
    position: 'absolute',
    top: 14,
    width: 14,
    height: 10,
    borderRadius: 6,
    backgroundColor: '#C13C47',
  },
  badgeCaption: {
    fontSize: 12,
    color: COLORS.softSlate,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  badgeHighlight: {
    color: COLORS.teal,
  },
  badgeDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.accent,
  },
});

function HeaderBar() {
  return (
    <View style={styles.headerBar}>
      <View style={styles.headerTexts}>
        <Text style={styles.headerTitle}>Manage Your Contributions</Text>
        <Text style={styles.headerSubtitle}>Welcome, User 1!</Text>
      </View>
      <View style={styles.headerBadge}>
        <View style={styles.badgeIconRow}>
          <View style={styles.hiLogo}>
            <View style={styles.hiLogoStem} />
            <View style={styles.hiLogoDot} />
          </View>
          <View style={styles.badgeDivider} />
          <View style={styles.berryLogo}>
            <View style={[styles.berryPetal, styles.berryPetalLeft]} />
            <View style={[styles.berryPetal, styles.berryPetalRight]} />
            <View style={styles.berryPetalBottom} />
          </View>
        </View>
        <Text style={styles.badgeCaption}>
          <Text style={styles.badgeHighlight}>Human Interest</Text> × Berry Clean
        </Text>
      </View>
    </View>
  );
}

