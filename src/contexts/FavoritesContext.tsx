import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EventDisplay } from '../types';

const FAVORITES_STORAGE_KEY = '@lifex_favorites_events';

interface FavoritesContextType {
  favoriteEvents: Set<string | number>;
  favoriteEventsList: EventDisplay[];
  toggleFavorite: (eventId: string | number, eventData?: EventDisplay) => Promise<void>;
  isFavorite: (eventId: string | number) => boolean;
  clearFavorites: () => Promise<void>;
  loadFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

interface FavoritesProviderProps {
  children: ReactNode;
}

export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({ children }) => {
  const [favoriteEvents, setFavoriteEvents] = useState<Set<string | number>>(new Set());
  const [favoriteEventsList, setFavoriteEventsList] = useState<EventDisplay[]>([]);

  // Load favorites from AsyncStorage on mount
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) {
        const { ids, events } = JSON.parse(stored);
        setFavoriteEvents(new Set(ids));
        setFavoriteEventsList(events || []);
        console.log('Loaded favorites:', ids.length, 'events');
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const saveFavorites = async (ids: Set<string | number>, events: EventDisplay[]) => {
    try {
      const data = {
        ids: Array.from(ids),
        events,
      };
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(data));
      console.log('Saved favorites:', ids.size, 'events');
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  };

  const toggleFavorite = async (eventId: string | number, eventData?: EventDisplay) => {
    setFavoriteEvents(prev => {
      const newFavorites = new Set(prev);
      let newEventsList = [...favoriteEventsList];

      if (newFavorites.has(eventId)) {
        // Remove from favorites
        newFavorites.delete(eventId);
        newEventsList = newEventsList.filter(e => e.id !== eventId);
        console.log('Removed from favorites:', eventId);
      } else {
        // Add to favorites
        newFavorites.add(eventId);
        if (eventData) {
          // Check if event already exists in list
          const exists = newEventsList.some(e => e.id === eventId);
          if (!exists) {
            newEventsList.push(eventData);
          }
        }
        console.log('Added to favorites:', eventId);
      }

      setFavoriteEventsList(newEventsList);
      saveFavorites(newFavorites, newEventsList);
      
      return newFavorites;
    });
  };

  const isFavorite = (eventId: string | number): boolean => {
    return favoriteEvents.has(eventId);
  };

  const clearFavorites = async () => {
    try {
      await AsyncStorage.removeItem(FAVORITES_STORAGE_KEY);
      setFavoriteEvents(new Set());
      setFavoriteEventsList([]);
      console.log('Cleared all favorites');
    } catch (error) {
      console.error('Error clearing favorites:', error);
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favoriteEvents,
        favoriteEventsList,
        toggleFavorite,
        isFavorite,
        clearFavorites,
        loadFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

