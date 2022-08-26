import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from 'styled-components';

import { HighlightCard } from '../../components/HighlightCard';
import { TransactionCard, TransactionCardProps } from '../../components/TransactionCard';

import { 
  Container,
  Header,
  UserWrapper,
  UserInfo,
  Photo,
  User,
  UserGreeting,
  UserName,
  Icon,
  HighlightCards,
  Transactions,
  Title,
  TransactionList,
  LogoutButton,
  LoadContainer
} from './styles';
import { useAuth } from '../../hooks/auth';

export interface DataListProps extends TransactionCardProps {
  id: string;
}

interface HighlightProps {
  amount: string;
  lastTransaction: string;
}

interface HighlightData {
  entries: HighlightProps;
  expensives: HighlightProps;
  total: HighlightProps;
}

export function Dashboard () {
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<DataListProps[]>([]);
  const [highlightData, setHighlightData] = useState<HighlightData>({} as HighlightData);
  
  const theme = useTheme();
  const { signOut, user } = useAuth();
  const dataKey = `@realFinances:transactions_user:${user.id}`;


  function getLastTransactionDate(
    collection: DataListProps[],
    type: 'positive' | 'negative'
  ) {
    const collectionFilttered = collection
    .filter(transaction => transaction.type === type);

    if(collectionFilttered.length === 0)
      return 0;

    const lastTransaction = new Date(Math.max.apply(Math, collectionFilttered
      .map(transaction => new Date (transaction.date).getTime())));
      
      return `on ${lastTransaction.toLocaleString('en-GB', { month: 'long'})} ${lastTransaction.getDate()}`;

  }

  async function loadTransactions(){
    const response = await AsyncStorage.getItem(dataKey);
    const transactions = response ? JSON.parse(response) : [];

    let entriesTotal = 0;
    let expensiveTotal = 0;

    const transactionsFormatted: DataListProps[] = transactions
    .map((item: DataListProps) => {
      if(item.type === 'positive'){
        entriesTotal += Number(item.amount);
      } else {
        expensiveTotal += Number(item.amount);
      }

      const amount = Number(item.amount)
      .toLocaleString('en-GB', {
        minimumFractionDigits: 2,
        style: 'currency',
        currency: 'GBP'
      });

      const date = Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      }).format(new Date(item.date));

      return {
        id: item.id,
        name: item.name,
        amount,
        type: item.type,
        category: item.category,
        date,
      }

    });

    setTransactions(transactionsFormatted);

    const lastTransactionEntries = getLastTransactionDate(transactions, 'positive');
    const lastTransactionExpensives = getLastTransactionDate(transactions, 'negative');
    
    const totalInterval = lastTransactionExpensives === 0
    ? 'There is no transaction'
    : `01 to ${lastTransactionExpensives}`;
    
    const total = entriesTotal - expensiveTotal;

    setHighlightData({
      entries: {
        amount: entriesTotal.toLocaleString('en-GB', {
          minimumFractionDigits: 2,
          style: 'currency',
          currency: 'GBP'
        }),
        lastTransaction: lastTransactionEntries === 0 
        ? 'There is no transaction'
        : `Last money in ${lastTransactionEntries}`,
      },
      expensives: {
        amount: expensiveTotal.toLocaleString('en-GB', {
          minimumFractionDigits: 2,
          style: 'currency',
          currency: 'GBP'
        }),
        lastTransaction: lastTransactionExpensives === 0
        ? 'There is no transaction'
        : `Last money out ${lastTransactionExpensives}`,
      },
      total: {
        amount: total.toLocaleString('en-GB', {
          minimumFractionDigits: 2,
          style: 'currency',
          currency: 'GBP'
        }),
        lastTransaction: totalInterval
      }
    });

    setIsLoading(false);

  }

  useEffect(()=> {
    loadTransactions();

  }, []);

  useFocusEffect(useCallback(() => {
    loadTransactions();
  }, []));

  return (
    <Container>
      {
      isLoading ? 
        <LoadContainer>
          <ActivityIndicator color={theme.colors.primary} size="large"/> 
        </LoadContainer>  :
        <>
          <Header>
            <UserWrapper>
              <UserInfo>
                <Photo source={{ uri: user.photo }} />
                <User>
                  <UserGreeting>Hi</UserGreeting>
                  <UserName>{user.name}</UserName>
                </User>
              </UserInfo>
              <LogoutButton onPress={signOut}>
                <Icon name="power" />
              </LogoutButton>
            </UserWrapper>
          </Header>

          <HighlightCards>
            <HighlightCard 
              type='up'
              title='Money In' 
              amount={highlightData?.entries?.amount} 
              lastTransaction={highlightData?.entries?.lastTransaction} 
            />
            <HighlightCard 
              type='down'
              title='Money out' 
              amount={highlightData?.expensives?.amount} 
              lastTransaction={highlightData?.expensives?.lastTransaction} 
            />
            <HighlightCard 
              type='total'
              title='Total' 
              amount={highlightData?.total?.amount} 
              lastTransaction={highlightData?.total?.lastTransaction} 
            />

          </HighlightCards>

          <Transactions>
            <Title>List</Title>
            <TransactionList 
              data={transactions}
              keyExtractor={item => item.id}
              renderItem={({ item }) => <TransactionCard data={item} /> }
            />
            
          </Transactions>
        </>
      }
    </Container>
  )
}