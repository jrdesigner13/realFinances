import React from 'react';
import { FlatList } from 'react-native';
import  Button  from '../../components/Form/Button';
import { categories } from '../../utils/categories';
import { 
  Container,
  Header,
  Title,
  CategoryContainer,
  Icon,
  Name,
  Separator,
  Footer,
} from './styles';

interface Category {
  key: string;
  name: string;
}

interface Props {
  category: Category;
  setCategory: (category: Category) => void;
  closeSelectCategory: () => void;
}

export function CategorySel({
  category,
  setCategory,
  closeSelectCategory
}: Props) {
  
  function handleCategorySelect(category: Category) {
    setCategory(category);
  }

  return (
    <Container>
      <Header>
        <Title>Category</Title>
      </Header>
      <FlatList
        data={categories} 
        style={{ flex: 1, width: '100%'}}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <CategoryContainer 
            onPress={() => handleCategorySelect(item)}
            isActive={category.key === item.key}
          >
            <Icon name={item.icon} />
            <Name>{item.name}</Name>
          </CategoryContainer>
        )}
        ItemSeparatorComponent={() => <Separator />}
      />
      <Footer>
        <Button 
          title='Select' 
          onPress={closeSelectCategory}
        />
      </Footer>
    </Container>
  )
}