import { supabase } from '../lib/supabase';

export interface Quote {
    id?: string;
    text: string;
    author: string;
    category?: string;
    tags?: string[] | null;
}

/**
 * Add a quote to user's favorites
 */
export async function addToFavorites(userId: string, quote: Quote): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('favorites')
            .insert({
                user_id: userId,
                quote_id: quote.id || null,
                quote_text: quote.text,
                quote_author: quote.author
            });

        if (error) {
            if (error.code === '23505') {
                // Already favorited
                return false;
            }
            throw error;
        }
        return true;
    } catch (error) {
        console.error('Error adding to favorites:', error);
        throw error;
    }
}

/**
 * Remove a quote from user's favorites
 */
export async function removeFromFavorites(userId: string, favoriteId: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('favorites')
            .delete()
            .eq('id', favoriteId)
            .eq('user_id', userId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error removing from favorites:', error);
        throw error;
    }
}

/**
 * Check if a quote is favorited by user
 */
export async function isFavorited(userId: string, quoteId: string): Promise<boolean> {
    try {
        const { data, error } = await supabase
            .from('favorites')
            .select('id')
            .eq('user_id', userId)
            .eq('quote_id', quoteId)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }
        return !!data;
    } catch (error) {
        console.error('Error checking favorite:', error);
        return false;
    }
}

/**
 * Create a new collection
 */
export async function createCollection(
    userId: string,
    name: string,
    icon: string = '📚',
    color: string = '#0F766E'
): Promise<string | null> {
    try {
        const { data, error } = await supabase
            .from('collections')
            .insert({
                user_id: userId,
                name,
                icon,
                color
            })
            .select()
            .single();

        if (error) throw error;
        return data.id;
    } catch (error) {
        console.error('Error creating collection:', error);
        throw error;
    }
}

/**
 * Add quote to a collection
 */
export async function addToCollection(
    collectionId: string,
    quote: Quote
): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('collection_quotes')
            .insert({
                collection_id: collectionId,
                quote_id: quote.id || null,
                quote_text: quote.text,
                quote_author: quote.author
            });

        if (error) {
            if (error.code === '23505') {
                // Already in collection
                return false;
            }
            throw error;
        }
        return true;
    } catch (error) {
        console.error('Error adding to collection:', error);
        throw error;
    }
}
