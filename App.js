// Импорт `react-native-gesture-handler` должен быть самым первым
import 'react-native-gesture-handler';
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  SafeAreaView,
  ImageBackground,
  FlatList,
  Alert,
  Platform,
  StatusBar,
  Dimensions,
  ScrollView,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NavigationContainer } from '@react-navigation/native';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons'; // Изменено для совместимости с Expo

// Встроенные переводы
const translations = {
  ru: {
    expenses: 'Расходы',
    income: 'Доходы',
    history: 'История',
    settings: 'Настройки',
    language: 'Язык',
    expenseNamePlaceholder: 'Название расхода',
    incomeNamePlaceholder: 'Название дохода',
    amountPlaceholder: 'Сумма',
    selectCategory: 'Выберите категорию',
    selectCurrency: 'Выберите валюту',
    selectDate: 'Выберите дату',
    selectTime: 'Выберите время',
    addExpense: 'Добавить расход',
    addIncome: 'Добавить доход',
    categories: {
      food: 'Еда',
      transport: 'Транспорт',
      entertainment: 'Развлечения',
      shopping: 'Покупки',
      services: 'Услуги',
      salary: 'Зарплата',
      service: 'Услуга',
    },
    expenseAdded: 'Расход добавлен!',
    incomeAdded: 'Доход добавлен!',
    reportGenerated: 'Отчет сформирован!',
    generatePDF: 'Сформировать отчет в PDF',
    error: 'Ошибка',
    pleaseEnterNameAndAmount: 'Пожалуйста, введите название и сумму',
    noTransactions: 'Нет транзакций для отображения.',
    deleteConfirmation: 'Вы уверены, что хотите удалить эту транзакцию?',
    delete: 'Удалить',
    cancel: 'Отмена',
    transactionDeleted: 'Транзакция удалена!',
    selectLanguage: 'Выберите язык',
  },
  en: {
    expenses: 'Expenses',
    income: 'Income',
    history: 'History',
    settings: 'Settings',
    language: 'Language',
    expenseNamePlaceholder: 'Expense name',
    incomeNamePlaceholder: 'Income name',
    amountPlaceholder: 'Amount',
    selectCategory: 'Select category',
    selectCurrency: 'Select currency',
    selectDate: 'Select date',
    selectTime: 'Select time',
    addExpense: 'Add Expense',
    addIncome: 'Add Income',
    categories: {
      food: 'Food',
      transport: 'Transport',
      entertainment: 'Entertainment',
      shopping: 'Shopping',
      services: 'Services',
      salary: 'Salary',
      service: 'Service',
    },
    expenseAdded: 'Expense added!',
    incomeAdded: 'Income added!',
    reportGenerated: 'Report generated!',
    generatePDF: 'Generate PDF Report',
    error: 'Error',
    pleaseEnterNameAndAmount: 'Please enter name and amount',
    noTransactions: 'No transactions to display.',
    deleteConfirmation: 'Are you sure you want to delete this transaction?',
    delete: 'Delete',
    cancel: 'Cancel',
    transactionDeleted: 'Transaction deleted!',
    selectLanguage: 'Select Language',
  },
};

// Функция для показа стильного всплывающего уведомления
function showToast(message) {
  Alert.alert('', message, [{ text: 'OK', style: 'default' }], {
    cancelable: true,
  });
}

// Получение размеров экрана
const { width, height } = Dimensions.get('window');

// Экран расходов
function ExpenseTrackerScreen({ addTransaction, language }) {
  const [expenseName, setExpenseName] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('food');
  const [selectedCurrency, setSelectedCurrency] = useState('AZN');
  const [date, setDate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [mode, setMode] = useState('date');

  const t = translations[language];

  const showDatePicker = () => {
    setMode('date');
    setDatePickerVisibility(true);
  };

  const showTimePicker = () => {
    setMode('time');
    setDatePickerVisibility(true);
  };

  const onChange = (event, selectedDate) => {
    setDatePickerVisibility(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const addExpense = useCallback(() => {
    if (
      !expenseName ||
      !expenseAmount ||
      isNaN(parseFloat(expenseAmount)) ||
      parseFloat(expenseAmount) <= 0
    ) {
      Alert.alert(t.error, t.pleaseEnterNameAndAmount);
      return;
    }

    const newTransaction = {
      id: Date.now().toString(),
      type: 'expense',
      name: expenseName,
      amount: parseFloat(expenseAmount),
      category: selectedCategory,
      currency: selectedCurrency,
      date: date.toLocaleString(),
    };

    addTransaction(newTransaction);
    setExpenseName('');
    setExpenseAmount('');
    Keyboard.dismiss();

    showToast(t.expenseAdded);
  }, [
    expenseName,
    expenseAmount,
    selectedCategory,
    selectedCurrency,
    date,
    addTransaction,
    t,
  ]);

  return (
    <ImageBackground
      source={require('./assets/fon.jpg')}
      style={styles.background}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.container}>
        <ScrollView>
          <Text style={styles.title}>{t.expenses}</Text>
          <TextInput
            style={styles.input}
            placeholder={t.expenseNamePlaceholder}
            placeholderTextColor="#ccc"
            value={expenseName}
            onChangeText={setExpenseName}
          />
          <TextInput
            style={styles.input}
            placeholder={t.amountPlaceholder}
            placeholderTextColor="#ccc"
            keyboardType="numeric"
            value={expenseAmount}
            onChangeText={setExpenseAmount}
          />
          <RNPickerSelect
            onValueChange={setSelectedCategory}
            items={Object.keys(t.categories).map((key) => ({
              label: t.categories[key],
              value: key,
            }))}
            placeholder={{ label: t.selectCategory, value: null }}
            style={pickerSelectStyles}
            value={selectedCategory}
            Icon={() => {
              return (
                <Ionicons
                  name="chevron-down"
                  size={24}
                  color="#fff"
                  style={{ marginRight: 10 }}
                />
              );
            }}
          />
          <RNPickerSelect
            onValueChange={setSelectedCurrency}
            items={[
              { label: 'AZN', value: 'AZN' },
              { label: 'USD', value: 'USD' },
              { label: 'EUR', value: 'EUR' },
              { label: 'NIS', value: 'ILS' },
              { label: 'RUB', value: 'RUB' },
            ]}
            placeholder={{ label: t.selectCurrency, value: null }}
            style={pickerSelectStyles}
            value={selectedCurrency}
            Icon={() => {
              return (
                <Ionicons
                  name="chevron-down"
                  size={24}
                  color="#fff"
                  style={{ marginRight: 10 }}
                />
              );
            }}
          />
          <TouchableOpacity onPress={showDatePicker} style={styles.stylishButton}>
            <Ionicons
              name="calendar"
              size={20}
              color="#fff"
              style={{ marginRight: 10 }}
            />
            <Text style={styles.buttonText}>
              {t.selectDate}: {date.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={showTimePicker} style={styles.stylishButton}>
            <Ionicons
              name="time"
              size={20}
              color="#fff"
              style={{ marginRight: 10 }}
            />
            <Text style={styles.buttonText}>
              {t.selectTime}: {date.toLocaleTimeString()}
            </Text>
          </TouchableOpacity>
          {isDatePickerVisible && (
            <DateTimePicker
              value={date}
              mode={mode}
              is24Hour={true}
              display="default"
              onChange={onChange}
              style={{ backgroundColor: 'white' }}
            />
          )}
          <TouchableOpacity onPress={addExpense} style={styles.stylishAddButton}>
            <Ionicons
              name="add-circle"
              size={24}
              color="#fff"
              style={{ marginRight: 10 }}
            />
            <Text style={styles.addButtonText}>{t.addExpense}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

// Экран доходов
function IncomeTrackerScreen({ addTransaction, language }) {
  const [incomeName, setIncomeName] = useState('');
  const [incomeAmount, setIncomeAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('salary');
  const [selectedCurrency, setSelectedCurrency] = useState('AZN');
  const [date, setDate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [mode, setMode] = useState('date');

  const t = translations[language];

  const showDatePicker = () => {
    setMode('date');
    setDatePickerVisibility(true);
  };

  const showTimePicker = () => {
    setMode('time');
    setDatePickerVisibility(true);
  };

  const onChange = (event, selectedDate) => {
    setDatePickerVisibility(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const addIncome = useCallback(() => {
    if (
      !incomeName ||
      !incomeAmount ||
      isNaN(parseFloat(incomeAmount)) ||
      parseFloat(incomeAmount) <= 0
    ) {
      Alert.alert(t.error, t.pleaseEnterNameAndAmount);
      return;
    }

    const newTransaction = {
      id: Date.now().toString(),
      type: 'income',
      name: incomeName,
      amount: parseFloat(incomeAmount),
      category: selectedCategory,
      currency: selectedCurrency,
      date: date.toLocaleString(),
    };

    addTransaction(newTransaction);
    setIncomeName('');
    setIncomeAmount('');
    Keyboard.dismiss();

    showToast(t.incomeAdded);
  }, [
    incomeName,
    incomeAmount,
    selectedCategory,
    selectedCurrency,
    date,
    addTransaction,
    t,
  ]);

  return (
    <ImageBackground
      source={require('./assets/fon.jpg')}
      style={styles.background}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.container}>
        <ScrollView>
          <Text style={styles.title}>{t.income}</Text>
          <TextInput
            style={styles.input}
            placeholder={t.incomeNamePlaceholder}
            placeholderTextColor="#ccc"
            value={incomeName}
            onChangeText={setIncomeName}
          />
          <TextInput
            style={styles.input}
            placeholder={t.amountPlaceholder}
            placeholderTextColor="#ccc"
            keyboardType="numeric"
            value={incomeAmount}
            onChangeText={setIncomeAmount}
          />
          <RNPickerSelect
            onValueChange={setSelectedCategory}
            items={[
              { label: t.categories.salary, value: 'salary' },
              { label: t.categories.service, value: 'service' },
            ]}
            placeholder={{ label: t.selectCategory, value: null }}
            style={pickerSelectStyles}
            value={selectedCategory}
            Icon={() => {
              return (
                <Ionicons
                  name="chevron-down"
                  size={24}
                  color="#fff"
                  style={{ marginRight: 10 }}
                />
              );
            }}
          />
          <RNPickerSelect
            onValueChange={setSelectedCurrency}
            items={[
              { label: 'AZN', value: 'AZN' },
              { label: 'USD', value: 'USD' },
              { label: 'EUR', value: 'EUR' },
              { label: 'NIS', value: 'ILS' },
              { label: 'RUB', value: 'RUB' },
            ]}
            placeholder={{ label: t.selectCurrency, value: null }}
            style={pickerSelectStyles}
            value={selectedCurrency}
            Icon={() => {
              return (
                <Ionicons
                  name="chevron-down"
                  size={24}
                  color="#fff"
                  style={{ marginRight: 10 }}
                />
              );
            }}
          />
          <TouchableOpacity onPress={showDatePicker} style={styles.stylishButton}>
            <Ionicons
              name="calendar"
              size={20}
              color="#fff"
              style={{ marginRight: 10 }}
            />
            <Text style={styles.buttonText}>
              {t.selectDate}: {date.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={showTimePicker} style={styles.stylishButton}>
            <Ionicons
              name="time"
              size={20}
              color="#fff"
              style={{ marginRight: 10 }}
            />
            <Text style={styles.buttonText}>
              {t.selectTime}: {date.toLocaleTimeString()}
            </Text>
          </TouchableOpacity>
          {isDatePickerVisible && (
            <DateTimePicker
              value={date}
              mode={mode}
              is24Hour={true}
              display="default"
              onChange={onChange}
              style={{ backgroundColor: 'white' }}
            />
          )}
          <TouchableOpacity onPress={addIncome} style={styles.stylishAddButton}>
            <Ionicons
              name="add-circle"
              size={24}
              color="#fff"
              style={{ marginRight: 10 }}
            />
            <Text style={styles.addButtonText}>{t.addIncome}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

// Экран истории транзакций
function HistoryScreen({ transactions, deleteTransaction, language }) {
  const t = translations[language];

  const generatePDFReport = async () => {
    let reportContent = `<h1 style="color:black;">${t.history}</h1><ul style="color:black;">`;

    transactions.forEach((transaction) => {
      reportContent += `<li><strong>${transaction.name}</strong> (${t.categories[transaction.category]}) - ${transaction.amount} ${transaction.currency} | ${transaction.date}</li>`;
    });

    reportContent += '</ul>';

    try {
      const { uri } = await Print.printToFileAsync({
        html: reportContent,
        fileName: 'TransactionReport.pdf',
      });
      showToast(t.reportGenerated);

      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert(t.error, 'Не удалось сформировать PDF отчет.');
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      t.delete,
      t.deleteConfirmation,
      [
        {
          text: t.cancel,
          style: 'cancel',
        },
        {
          text: t.delete,
          style: 'destructive',
          onPress: () => deleteTransaction(id),
        },
      ],
      { cancelable: true }
    );
  };

  const renderTransaction = useCallback(
    ({ item }) => (
      <View style={styles.transactionItem}>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionText}>
            {`${item.name} (${t.categories[item.category]}) - ${item.amount} ${item.currency}`}
          </Text>
          <Text style={styles.transactionDate}>{item.date}</Text>
        </View>
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
          <Ionicons name="trash-bin" size={24} color="#ff4444" />
        </TouchableOpacity>
      </View>
    ),
    [t]
  );

  const listHeader = useCallback(
    () => (
      <View>
        <Text style={styles.title}>{t.history}</Text>
      </View>
    ),
    [t]
  );

  const listFooter = useCallback(
    () => (
      <TouchableOpacity onPress={generatePDFReport} style={styles.pdfButton}>
        <Ionicons
          name="document-text"
          size={20}
          color="#fff"
          style={{ marginRight: 10 }}
        />
        <Text style={styles.pdfButtonText}>{t.generatePDF}</Text>
      </TouchableOpacity>
    ),
    [generatePDFReport, t]
  );

  const listEmpty = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{t.noTransactions}</Text>
      </View>
    ),
    [t]
  );

  return (
    <ImageBackground
      source={require('./assets/fon.jpg')}
      style={styles.background}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.container}>
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={renderTransaction}
          ListHeaderComponent={listHeader}
          ListFooterComponent={listFooter}
          ListEmptyComponent={listEmpty}
          contentContainerStyle={{ paddingBottom: 20 }}
          initialNumToRender={10}
          removeClippedSubviews={true}
        />
      </SafeAreaView>
    </ImageBackground>
  );
}

// Экран настроек
function SettingsScreen({ language, setLanguage }) {
  const t = translations[language];

  return (
    <ImageBackground
      source={require('./assets/fon.jpg')}
      style={styles.background}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>{t.settings}</Text>
        <View style={styles.languageContainer}>
          <Text style={styles.languageText}>{t.selectLanguage}:</Text>
          <RNPickerSelect
            onValueChange={(value) => setLanguage(value)}
            items={[
              { label: 'English', value: 'en' },
              { label: 'Русский', value: 'ru' },
            ]}
            placeholder={{}}
            style={pickerSelectStyles}
            value={language}
            Icon={() => {
              return (
                <Ionicons
                  name="chevron-down"
                  size={24}
                  color="#fff"
                  style={{ marginRight: 10 }}
                />
              );
            }}
          />
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

// Пользовательское меню с темным фоном и интерактивными элементами
function CustomDrawerContent(props) {
  const { language } = props;
  const t = translations[language];

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.drawerContent}
    >
      <View style={styles.gradientBackground}>
        <View style={styles.drawerHeader}>
          <Ionicons name="wallet-outline" size={80} color="#fff" />
          <Text style={styles.drawerHeaderText}>MoneyReport</Text>
        </View>
        <DrawerItemList {...props} />
        {/* Удалили дублирующийся пункт "Настройки" */}
      </View>
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>App created by Yusif Mamedov</Text>
      </View>
    </DrawerContentScrollView>
  );
}

// Создаем Drawer навигацию
const Drawer = createDrawerNavigator();

function DrawerNavigator({
  transactions,
  addTransaction,
  deleteTransaction,
  language,
  setLanguage,
}) {
  const t = translations[language];

  return (
    <Drawer.Navigator
      drawerContent={(props) => (
        <CustomDrawerContent
          {...props}
          language={language}
          setLanguage={setLanguage}
        />
      )}
      screenOptions={({ route, navigation }) => ({
        drawerStyle: { backgroundColor: '#1e1e1e' },
        drawerLabelStyle: { color: '#fff', fontSize: 18 },
        drawerActiveTintColor: '#fff',
        drawerInactiveTintColor: '#fff',
        headerShown: true,
        headerStyle: { backgroundColor: '#1e1e1e' },
        headerTintColor: '#fff',
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.toggleDrawer()}
            style={{ marginLeft: 15 }}
          >
            <Ionicons name="menu" size={28} color="#fff" />
          </TouchableOpacity>
        ),
        headerTitle: t[route.name.toLowerCase()] || 'MoneyReport',
        drawerIcon: ({ focused, size, color }) => {
          let iconName;

          if (route.name === 'Expenses') {
            iconName = focused ? 'pricetag-sharp' : 'pricetag-outline';
          } else if (route.name === 'Income') {
            iconName = focused ? 'wallet-sharp' : 'wallet-outline';
          } else if (route.name === 'History') {
            iconName = focused ? 'time-sharp' : 'time-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings-sharp' : 'settings-outline';
          } else {
            iconName = 'help-circle-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Drawer.Screen
        name="Expenses"
        options={{
          drawerLabel: t.expenses,
          title: t.expenses,
        }}
      >
        {(props) => (
          <ExpenseTrackerScreen
            {...props}
            addTransaction={addTransaction}
            language={language}
          />
        )}
      </Drawer.Screen>
      <Drawer.Screen
        name="Income"
        options={{
          drawerLabel: t.income,
          title: t.income,
        }}
      >
        {(props) => (
          <IncomeTrackerScreen
            {...props}
            addTransaction={addTransaction}
            language={language}
          />
        )}
      </Drawer.Screen>
      <Drawer.Screen
        name="History"
        options={{
          drawerLabel: t.history,
          title: t.history,
        }}
      >
        {(props) => (
          <HistoryScreen
            {...props}
            transactions={transactions}
            deleteTransaction={deleteTransaction}
            language={language}
          />
        )}
      </Drawer.Screen>
      <Drawer.Screen
        name="Settings"
        options={{
          drawerLabel: t.settings,
          title: t.settings,
        }}
      >
        {(props) => (
          <SettingsScreen
            {...props}
            language={language}
            setLanguage={setLanguage}
          />
        )}
      </Drawer.Screen>
    </Drawer.Navigator>
  );
}

function App() {
  const [transactions, setTransactions] = useState([]);
  const [language, setLanguage] = useState('ru');

  const addTransaction = useCallback((newTransaction) => {
    setTransactions((prevTransactions) => [...prevTransactions, newTransaction]);
  }, []);

  const deleteTransaction = useCallback(
    (id) => {
      setTransactions((prevTransactions) =>
        prevTransactions.filter((item) => item.id !== id)
      );
      showToast(translations[language].transactionDeleted);
    },
    [language]
  );

  return (
    <NavigationContainer>
      <DrawerNavigator
        transactions={transactions}
        addTransaction={addTransaction}
        deleteTransaction={deleteTransaction}
        language={language}
        setLanguage={setLanguage}
      />
    </NavigationContainer>
  );
}

// Стили для компонентов и выбора
const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    width: width,
    height: height,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'rgba(30, 30, 30, 0.85)',
    borderRadius: 15,
    margin: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginVertical: 20,
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#444',
    padding: 12,
    marginVertical: 10,
    borderRadius: 10,
    backgroundColor: '#1e1e1e',
    fontSize: 16,
    color: '#fff',
  },
  stylishButton: {
    backgroundColor: '#FF5722',
    padding: 15,
    borderRadius: 12,
    marginVertical: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    flexShrink: 1,
  },
  stylishAddButton: {
    backgroundColor: '#4CAF50',
    padding: 20,
    borderRadius: 20,
    marginTop: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 7,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
    flexShrink: 1,
  },
  transactionItem: {
    backgroundColor: '#2e2e2e',
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
    paddingRight: 10,
  },
  transactionText: {
    fontSize: 16,
    color: '#fff',
    flexWrap: 'wrap',
  },
  transactionDate: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 5,
  },
  pdfButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  pdfButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  footerContainer: {
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#fff',
    alignItems: 'center',
  },
  footerText: {
    color: '#fff',
    fontSize: 14,
  },
  drawerContent: {
    flex: 1,
    backgroundColor: '#1e1e1e',
  },
  gradientBackground: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  drawerHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  drawerHeaderText: {
    marginTop: 10,
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#fff',
  },
  deleteButton: {
    padding: 5,
  },
  languageContainer: {
    marginTop: 20,
  },
  languageText: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 10,
  },
});

// Стили для выбора категорий и валют
const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 10,
    color: '#fff',
    backgroundColor: '#1e1e1e',
    marginVertical: 10,
    paddingRight: 30,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 10,
    color: '#fff',
    backgroundColor: '#1e1e1e',
    marginVertical: 10,
    paddingRight: 30,
  },
  iconContainer: {
    top: Platform.OS === 'ios' ? 20 : 15,
    right: 10,
  },
});

export default App;
