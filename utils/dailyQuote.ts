import { supabase } from '../lib/supabase';

/**
 * Get or create daily quote for user
 * Uses date-based selection to ensure same quote per day
 */
export async function getDailyQuote(userId: string): Promise<{
    id: string;
    text: string;
    author: string;
    category: string;
    tags: string[] | null;
} | null> {
    try {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        // Check if user already has a quote for today
        const { data: existingDailyQuote, error: checkError } = await supabase
            .from('daily_quotes')
            .select('quote_id, quotes(*)')
            .eq('user_id', userId)
            .eq('date', today)
            .single();

        if (existingDailyQuote && !checkError) {
            // Return existing quote for today
            const quote = (existingDailyQuote as any).quotes;
            return {
                id: quote.id,
                text: quote.text,
                author: quote.author,
                category: quote.category,
                tags: quote.tags
            };
        }

        // Get a random quote (using date as seed for consistency)
        const { data: quotes, error: quotesError } = await supabase
            .from('quotes')
            .select('*')
            .limit(1000);

        if (quotesError || !quotes || quotes.length === 0) {
            throw new Error('No quotes available');
        }

        // Use date as seed for consistent daily selection
        const dateSeed = new Date(today).getTime();
        const randomIndex = Math.floor((dateSeed % quotes.length));
        const selectedQuote = quotes[randomIndex];

        // Save daily quote for user
        const { error: insertError } = await supabase
            .from('daily_quotes')
            .insert({
                user_id: userId,
                quote_id: selectedQuote.id,
                date: today
            });

        if (insertError) {
            // If table doesn't exist, log error but don't throw
            // This allows the app to still work, just without daily quote persistence
            if (insertError.code === 'PGRST205' || insertError.message?.includes('table')) {
                console.warn('daily_quotes table not found. Please run database migration. Quote will still be returned.');
            } else {
                console.error('Error saving daily quote:', insertError);
            }
        }

        return {
            id: selectedQuote.id,
            text: selectedQuote.text,
            author: selectedQuote.author,
            category: selectedQuote.category,
            tags: selectedQuote.tags
        };
    } catch (error: any) {
        console.error('Error getting daily quote:', error);
        return null;
    }
}
