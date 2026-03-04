import supabase from './supabase';
import './services/test';

const testConnection = async () => {
  console.log('Testing Supabase connection...');
  console.log('Supabase URL:', process.env.REACT_APP_SUPABASE_URL);
  
  try {
    const { data, error } = await supabase
      .from('crops')
      .select('*')
      .limit(5);
    
    console.log('Query result:', { data, error });
    
    if (error) {
      console.error('Error:', error);
    } else {
      console.log('Success! Crops found:', data.length);
      console.log('First crop:', data[0]);
    }
  } catch (err) {
    console.error('Exception:', err);
  }
};

testConnection();