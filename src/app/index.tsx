import { useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import {
  Alert,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type FormValues = Record<string, string | boolean>;

const initialValues: FormValues = {
  fullName: '',
  age: '',
  email: '',
  password: '',
  phone: '',
  projectName: '',
  repoLink: '',
  summary: '',
  projectType: '',
  projectStage: 'In progress',
  technologies: '',
  publicProject: true,
  deadline: '',
  meetingTime: '',
  startMonth: '',
  reviewWeek: '',
  color: '#256A50',
  progress: '50',
  source: 'project submission form',
};

const projectTypes = ['Mobile app', 'Website', 'Open-source tool'];
const projectSuggestions = ['Education', 'Health', 'Productivity', 'Community'];
const technologies = ['React Native', 'Expo', 'TypeScript'];
const stages = ['Planning', 'In progress', 'Ready to share'];
const colors = ['#256A50', '#3867D6', '#D46A43', '#7B58A5', '#333333'];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const timeSlots = Array.from({ length: 17 }, (_, index) => {
  const hour = 9 + Math.floor(index / 2);
  const minute = index % 2 === 0 ? '00' : '30';
  return `${String(hour).padStart(2, '0')}:${minute}`;
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Field({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{title}</Text>
      {children}
    </View>
  );
}

function dateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function HomeScreen() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [files, setFiles] = useState<DocumentPicker.DocumentPickerAsset[]>([]);
  const [image, setImage] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [projectTypeOpen, setProjectTypeOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [weekOpen, setWeekOpen] = useState(false);
  const [monthOpen, setMonthOpen] = useState(false);
  const [output, setOutput] = useState('');

  const setValue = (key: string, value: string | boolean) => {
    setValues((current) => ({ ...current, [key]: value }));
    setOutput('');
  };

  const captureForm = () => {
    Keyboard.dismiss();
    const captured = {
      ...values,
      files: files.map(({ name, size, uri, mimeType }) => ({ name, size, uri, mimeType })),
      image: image ? { name: image.name, size: image.size, uri: image.uri, mimeType: image.mimeType } : null,
    };
    console.log('Captured project form:', captured);
    setOutput(JSON.stringify(captured, null, 2));
  };

  const pickFiles = async (imagesOnly = false) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: !imagesOnly,
        type: imagesOnly ? 'image/*' : '*/*',
      });
      if (result.canceled) return;
      if (imagesOnly) setImage(result.assets[0]);
      else setFiles(result.assets);
      setOutput('');
    } catch {
      Alert.alert('Could not open files', 'Please try again.');
    }
  };

  const resetForm = () => {
    setValues(initialValues);
    setFiles([]);
    setImage(null);
    setOutput('');
    setCalendarOpen(false);
    setProjectTypeOpen(false);
    setWeekOpen(false);
    setMonthOpen(false);
  };

  const input = (
    key: string,
    placeholder: string,
    keyboardType: 'default' | 'email-address' | 'phone-pad' | 'url' | 'numeric' = 'default',
    secureTextEntry = false,
    multiline = false,
    autoCapitalize: 'none' | 'sentences' | 'words' = 'sentences',
  ) => (
    <TextInput
      accessibilityLabel={key}
      autoCapitalize={autoCapitalize}
      keyboardType={keyboardType}
      multiline={multiline}
      onChangeText={(text) => setValue(key, text)}
      onSubmitEditing={captureForm}
      placeholder={placeholder}
      returnKeyType="done"
      secureTextEntry={secureTextEntry}
      style={[styles.input, multiline && styles.multiline]}
      value={String(values[key] ?? '')}
    />
  );

  const toggleTechnology = (technology: string) => {
    const selected = String(values.technologies).split(',').filter(Boolean);
    const next = selected.includes(technology)
      ? selected.filter((item) => item !== technology)
      : [...selected, technology];
    setValue('technologies', next.join(','));
  };

  const calendarOffset = (calendarMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
  const calendarDays: Array<number | null> = [
    ...Array.from({ length: calendarOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
  const selectedDeadline = String(values.deadline);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Project submission</Text>
        <Text style={styles.description}>Tell us who you are and what you’re building.</Text>

        <Section title="About you">
          <Field title="Full name">{input('fullName', 'Your name', 'default', false, false, 'words')}</Field>
          <Field title="Age">{input('age', 'Your age', 'numeric')}</Field>
          <Field title="Email address">{input('email', 'you@example.com', 'email-address', false, false, 'none')}</Field>
          <Field title="Phone number">{input('phone', 'Phone number', 'phone-pad')}</Field>
          <Field title="Account password">{input('password', 'Password', 'default', true, false, 'none')}</Field>
        </Section>

        <Section title="Your project">
          <Field title="Project name">{input('projectName', 'e.g. Neighbourhood garden app')}</Field>
          <Field title="Repository link">{input('repoLink', 'https://github.com/name/project', 'url', false, false, 'none')}</Field>
          <Field title="What does it do?">{input('summary', 'A short project description', 'default', false, true)}</Field>

          <Field title="Project type">
            <Pressable accessibilityRole="button" onPress={() => setProjectTypeOpen(!projectTypeOpen)} style={styles.select}>
              <Text style={values.projectType ? styles.selectValue : styles.placeholder}>{String(values.projectType || 'Choose a type')}</Text>
              <Text style={styles.chevron}>{projectTypeOpen ? '−' : '+'}</Text>
            </Pressable>
            {projectTypeOpen ? projectTypes.map((type) => (
              <Pressable key={type} onPress={() => { setValue('projectType', type); setProjectTypeOpen(false); }} style={styles.option}>
                <Text style={styles.choiceText}>{type}</Text>
              </Pressable>
            )) : null}
          </Field>

          <Field title="Category">
            {input('category', 'Choose or type a category')}
            <View style={styles.chipRow}>
              {projectSuggestions.map((suggestion) => (
                <Pressable key={suggestion} onPress={() => setValue('category', suggestion)} style={styles.chip}>
                  <Text style={styles.chipText}>{suggestion}</Text>
                </Pressable>
              ))}
            </View>
          </Field>

          <Field title="Project stage">
            {stages.map((stage) => (
              <Pressable accessibilityRole="radio" accessibilityState={{ selected: values.projectStage === stage }} key={stage} onPress={() => setValue('projectStage', stage)} style={styles.choice}>
                <View style={styles.radio}>{values.projectStage === stage ? <View style={styles.radioDot} /> : null}</View>
                <Text style={styles.choiceText}>{stage}</Text>
              </Pressable>
            ))}
          </Field>

          <Field title="Technologies used">
            {technologies.map((technology) => {
              const selected = String(values.technologies).split(',').includes(technology);
              return (
                <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: selected }} key={technology} onPress={() => toggleTechnology(technology)} style={styles.choice}>
                  <View style={[styles.checkbox, selected && styles.checkboxChecked]}>{selected ? <Text style={styles.checkmark}>✓</Text> : null}</View>
                  <Text style={styles.choiceText}>{technology}</Text>
                </Pressable>
              );
            })}
          </Field>

          <Field title={`Project progress: ${values.progress}%`}>
            <View style={styles.chipRow}>
              {['0', '25', '50', '75', '100'].map((progress) => (
                <Pressable accessibilityRole="radio" accessibilityState={{ selected: values.progress === progress }} key={progress} onPress={() => setValue('progress', progress)} style={[styles.chip, values.progress === progress && styles.chipSelected]}>
                  <Text style={[styles.chipText, values.progress === progress && styles.chipTextSelected]}>{progress}%</Text>
                </Pressable>
              ))}
            </View>
          </Field>

          <Field title="Project color">
            <View style={styles.colorRow}>
              {colors.map((color) => (
                <Pressable accessibilityRole="radio" accessibilityLabel={`Choose ${color}`} accessibilityState={{ selected: values.color === color }} key={color} onPress={() => setValue('color', color)} style={[styles.colorSwatch, { backgroundColor: color }, values.color === color && styles.colorSelected]} />
              ))}
            </View>
          </Field>

          <View style={styles.switchRow}>
            <View style={styles.switchCopy}>
              <Text style={styles.label}>Public repository</Text>
              <Text style={styles.note}>Let others discover this project.</Text>
            </View>
            <Switch accessibilityLabel="Public repository" onValueChange={(value) => setValue('publicProject', value)} value={Boolean(values.publicProject)} />
          </View>
        </Section>

        <Section title="Schedule">
          <Field title="Target date">
            <Pressable accessibilityRole="button" accessibilityLabel="Choose target date from calendar" onPress={() => setCalendarOpen(!calendarOpen)} style={styles.select}>
              <Text style={selectedDeadline ? styles.selectValue : styles.placeholder}>{selectedDeadline || 'Choose a date'}</Text>
              <Text style={styles.calendarIcon}>▦</Text>
            </Pressable>
            {calendarOpen ? (
              <View style={styles.calendar}>
                <View style={styles.calendarHeader}>
                  <Pressable accessibilityLabel="Previous month" onPress={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))} style={styles.monthArrow}><Text style={styles.arrowText}>‹</Text></Pressable>
                  <Text style={styles.calendarMonth}>{calendarMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</Text>
                  <Pressable accessibilityLabel="Next month" onPress={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))} style={styles.monthArrow}><Text style={styles.arrowText}>›</Text></Pressable>
                </View>
                <View style={styles.calendarGrid}>
                  {weekdays.map((day) => <Text key={day} style={styles.weekday}>{day}</Text>)}
                  {calendarDays.map((day, index) => (
                    <View key={`${calendarMonth.getMonth()}-${index}`} style={styles.dayCell}>
                      {day ? (
                        <Pressable onPress={() => { setValue('deadline', dateKey(calendarMonth.getFullYear(), calendarMonth.getMonth(), day)); setCalendarOpen(false); }} style={[styles.dayButton, selectedDeadline === dateKey(calendarMonth.getFullYear(), calendarMonth.getMonth(), day) && styles.daySelected]}>
                          <Text style={[styles.dayText, selectedDeadline === dateKey(calendarMonth.getFullYear(), calendarMonth.getMonth(), day) && styles.dayTextSelected]}>{day}</Text>
                        </Pressable>
                      ) : null}
                    </View>
                  ))}
                </View>
              </View>
            ) : null}
          </Field>

          <Field title="Preferred time">
            <View style={styles.chipRow}>
              {timeSlots.map((time) => (
                <Pressable accessibilityRole="radio" accessibilityState={{ selected: values.meetingTime === time }} key={time} onPress={() => setValue('meetingTime', time)} style={[styles.timeChip, values.meetingTime === time && styles.chipSelected]}>
                  <Text style={[styles.chipText, values.meetingTime === time && styles.chipTextSelected]}>{time}</Text>
                </Pressable>
              ))}
            </View>
          </Field>

          <Field title="Start month">
            <Pressable accessibilityRole="button" onPress={() => setMonthOpen(!monthOpen)} style={styles.select}>
              <Text style={values.startMonth ? styles.selectValue : styles.placeholder}>{String(values.startMonth || 'Choose a month')}</Text>
              <Text style={styles.chevron}>{monthOpen ? '−' : '+'}</Text>
            </Pressable>
            {monthOpen ? (
              <View style={styles.monthGrid}>{months.map((month) => (
                <Pressable key={month} onPress={() => { setValue('startMonth', month); setMonthOpen(false); }} style={[styles.monthOption, values.startMonth === month && styles.monthOptionSelected]}>
                  <Text style={[styles.monthOptionText, values.startMonth === month && styles.monthOptionTextSelected]}>{month.slice(0, 3)}</Text>
                </Pressable>
              ))}</View>
            ) : null}
          </Field>

          <Field title="Review week">
            <Pressable accessibilityRole="button" onPress={() => setWeekOpen(!weekOpen)} style={styles.select}>
              <Text style={values.reviewWeek ? styles.selectValue : styles.placeholder}>{String(values.reviewWeek || 'Choose a week')}</Text>
              <Text style={styles.chevron}>{weekOpen ? '−' : '+'}</Text>
            </Pressable>
            {weekOpen ? ['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((week) => (
              <Pressable key={week} onPress={() => { setValue('reviewWeek', week); setWeekOpen(false); }} style={styles.option}><Text style={styles.choiceText}>{week}</Text></Pressable>
            )) : null}
          </Field>
        </Section>

        <Section title="Attachments">
          <Field title="Project files">
            <Pressable accessibilityRole="button" onPress={() => pickFiles()} style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>Choose files</Text></Pressable>
            {files.length ? files.map((file) => <Text key={`${file.uri}-${file.name}`} style={styles.note}>{file.name}</Text>) : <Text style={styles.note}>No files selected</Text>}
          </Field>
          <Field title="Project image">
            <Pressable accessibilityRole="button" onPress={() => pickFiles(true)} style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>Choose image</Text></Pressable>
            <Text style={styles.note}>{image?.name ?? 'No image selected'}</Text>
          </Field>
        </Section>

        <View style={styles.actions}>
          <Pressable accessibilityRole="button" onPress={captureForm} style={styles.submitButton}><Text style={styles.submitText}>Submit project</Text></Pressable>
          <Pressable accessibilityRole="button" onPress={resetForm} style={styles.resetButton}><Text style={styles.resetText}>Reset</Text></Pressable>
        </View>

        <Text style={styles.outputTitle}>Captured form data</Text>
        <Text selectable style={styles.output}>{output || 'Submitted values will appear here and in the console.'}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, paddingBottom: 32 },
  title: { color: '#111', fontSize: 24, fontWeight: '700', marginBottom: 4 },
  description: { color: '#555', fontSize: 14, marginBottom: 16 },
  section: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 12, marginBottom: 14 },
  sectionTitle: { color: '#111', fontSize: 17, fontWeight: '600', marginBottom: 10 },
  field: { marginBottom: 12 },
  label: { color: '#222', fontSize: 14, marginBottom: 5 },
  input: { minHeight: 42, borderWidth: 1, borderColor: '#aaa', borderRadius: 4, paddingHorizontal: 10, paddingVertical: 8, color: '#111', backgroundColor: '#fff', fontSize: 15 },
  multiline: { minHeight: 84, textAlignVertical: 'top' },
  note: { color: '#666', fontSize: 12, marginTop: 5 },
  select: { minHeight: 42, borderWidth: 1, borderColor: '#aaa', borderRadius: 4, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center' },
  selectValue: { color: '#111', flex: 1 },
  placeholder: { color: '#777', flex: 1 },
  chevron: { color: '#333', fontSize: 18 },
  option: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  choice: { minHeight: 34, flexDirection: 'row', alignItems: 'center', gap: 9 },
  choiceText: { color: '#222', fontSize: 14 },
  radio: { width: 18, height: 18, borderWidth: 1, borderColor: '#777', borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#256A50' },
  checkbox: { width: 18, height: 18, borderWidth: 1, borderColor: '#777', borderRadius: 3, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: '#256A50', borderColor: '#256A50' },
  checkmark: { color: '#fff', fontSize: 13 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip: { paddingVertical: 7, paddingHorizontal: 10, borderWidth: 1, borderColor: '#bbb', borderRadius: 4 },
  chipSelected: { backgroundColor: '#256A50', borderColor: '#256A50' },
  chipText: { color: '#333', fontSize: 12 },
  chipTextSelected: { color: '#fff' },
  colorRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  colorSwatch: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: '#ccc' },
  colorSelected: { borderWidth: 3, borderColor: '#111' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  switchCopy: { flex: 1 },
  calendarIcon: { color: '#333', fontSize: 17 },
  calendar: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginTop: 8 },
  calendarHeader: { height: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  monthArrow: { width: 38, height: 36, alignItems: 'center', justifyContent: 'center' },
  arrowText: { color: '#222', fontSize: 25 },
  calendarMonth: { color: '#111', fontSize: 15, fontWeight: '600' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  weekday: { width: '14.2857%', textAlign: 'center', color: '#666', fontSize: 11, paddingVertical: 8 },
  dayCell: { width: '14.2857%', height: 40, alignItems: 'center', justifyContent: 'center' },
  dayButton: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  daySelected: { backgroundColor: '#256A50' },
  dayText: { color: '#222', fontSize: 13 },
  dayTextSelected: { color: '#fff' },
  timeChip: { minWidth: 54, alignItems: 'center', paddingVertical: 8, paddingHorizontal: 8, borderWidth: 1, borderColor: '#bbb', borderRadius: 4 },
  monthGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  monthOption: { width: '23%', minHeight: 34, borderWidth: 1, borderColor: '#ccc', borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  monthOptionSelected: { backgroundColor: '#256A50', borderColor: '#256A50' },
  monthOptionText: { color: '#222', fontSize: 12 },
  monthOptionTextSelected: { color: '#fff' },
  secondaryButton: { minHeight: 40, borderWidth: 1, borderColor: '#777', borderRadius: 4, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 12 },
  secondaryButtonText: { color: '#222', fontSize: 14 },
  actions: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  submitButton: { flex: 1, minHeight: 44, backgroundColor: '#256A50', borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  submitText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  resetButton: { minWidth: 90, minHeight: 44, borderWidth: 1, borderColor: '#777', borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  resetText: { color: '#222', fontSize: 15 },
  outputTitle: { color: '#111', fontSize: 17, fontWeight: '600', marginBottom: 6 },
  output: { color: '#222', backgroundColor: '#f4f4f4', borderWidth: 1, borderColor: '#ddd', borderRadius: 4, padding: 10, fontFamily: 'monospace', fontSize: 12 },
});
