import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema } from '../../schemas/authSchema';

export default function UpdatePassword({ navigation }) {
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(resetPasswordSchema)
  });

  const onUpdate = async (data) => {
    const { error } = await supabase.auth.updateUser({ password: data.password });
    
    if (error) Alert.alert("Error", error.message);
    else {
      Alert.alert("Success", "Password updated!");
      navigation.navigate('Login');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>New Password</Text>
      {/* Implementation similar to Register input fields */}
      <TouchableOpacity style={styles.button} onPress={handleSubmit(onUpdate)}>
        <Text style={styles.buttonText}>Update Password</Text>
      </TouchableOpacity>
    </View>
  );
}