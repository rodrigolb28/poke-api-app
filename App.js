import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  StatusBar
} from 'react-native';

const API_URL = 'https://pokeapi.co/api/v2/pokemon?limit=30';

const PokemonCard = ({ name, image, type }) => (
  <View style={styles.card}>
    <Text style={styles.name}>{name.charAt(0).toUpperCase() + name.slice(1)}</Text>
    <Image style={styles.image} source={{ uri: image }} />
    <Text style={styles.typeText}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
  </View>
);

export default function App() {
  const [loading, setLoading] = useState(true);
  const [pokemonData, setPokemonData] = useState([]);
  const [searchData, setSearchData] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  const fetchPokemons = async () => {
    try {
      setError(null);
      const response = await fetch(API_URL);
      const json = await response.json();

      const detailRequests = json.results.map(async (item) => {
        const detailRes = await fetch(item.url);
        return detailRes.json();
      });

      const results = await Promise.all(detailRequests);

      const formattedData = results.map(p => ({
        id: p.id.toString(),
        name: p.name,
        image: p.sprites.front_default,
        type: p.types[0].type.name
      }));

      setPokemonData(formattedData);
      setSearchData(formattedData);
    } catch (err) {
      setError('Erro ao carregar os dados.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPokemons();
  }, []);

  const handleSearch = (text) => {
    setSearch(text);
    if (text) {
      const filtered = pokemonData.filter(item =>
        item.name.toLowerCase().includes(text.toLowerCase())
      );
      setSearchData(filtered);
    } else {
      setSearchData(pokemonData);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ef5350" />
        <Text style={styles.loadingText}>Carregando Pokémons...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.title}>PokéList</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar Pokémon por nome..."
          value={search}
          onChangeText={handleSearch}
        />
      </View>

      {error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={searchData}
          renderItem={({ item }) => (
            <PokemonCard
              key={item.id}  
              name={item.name}
              image={item.image}
              type={item.type}
            />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhum Pokémon encontrado.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#ef5350',
    marginBottom: 15,
  },
  searchInput: {
    height: 45,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
  },
  list: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  card: {
    flexDirection: 'column',
    backgroundColor: '#fff',
    marginBottom: 12,
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  image: {
    width: 90,
    height: 90,
    marginVertical: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    textTransform: 'capitalize',
    backgroundColor: '#fce4ec',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    textAlign: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  errorText: {
    color: '#ef5350',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#999',
    fontSize: 16,
  },
});