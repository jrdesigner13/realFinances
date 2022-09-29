import React, { 
  createContext, 
  ReactNode, 
  useContext, 
  useState, 
  useEffect 
} from "react";

const { ANDROID_CLIENT_ID } = process.env;

//import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';
import AsyncStorage from "@react-native-async-storage/async-storage";

const { EXPO_CLIENT_ID } = process.env;

const { IOS_CLIENT_ID } = process.env;
const { REDIRECT_URI } = process.env;

interface AuthProviderProps {
  children: ReactNode
}

interface User {
  id: string;
  name: string;
  email: string;
  photo?: string;
}

interface IAuthContextData {
  user: User;
  signInWithGoogleRequest(): Promise<void>;
  signInWithApple(): Promise<void>;
  signOut(): Promise<void>;
  userStorageLoading: boolean;
}

interface AuthorizationResponse {
  params: {
    access_token: string;
  };
  type: string;
}

const AuthContext = createContext({} as IAuthContextData);

function AuthProvider({ children }: AuthProviderProps ){
  const [user, setUser] = useState<User>({} as User);
  const [userStorageLoading, setUserStorageLoading] = useState(true);

  const userStorageKey = '@realFinances:user';

  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: EXPO_CLIENT_ID,
    androidClientId: '255015221240-2bvrvfjc3v9rsmq0do9818e681r7cv09.apps.googleusercontent.com',
    iosClientId: IOS_CLIENT_ID
   });

   async function signInWithGoogleRequest() {
    try {
      setUserStorageLoading(true);
      await promptAsync();
    } catch (error) {
      setUserStorageLoading(false);
      console.log(error);
      throw error;
    }
  }

  async function signInWithGoogle(accessToken: string){
    try {
      const response = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${accessToken}`);
      const userInfo = await response.json();

      const userLoggedIn = {
        id: userInfo.id,
        name: userInfo.given_name,
        email: userInfo.email,
        photo: userInfo.picture
      };

      setUser(userLoggedIn);
      await AsyncStorage.setItem(userStorageKey, JSON.stringify(userLoggedIn));
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      setUserStorageLoading(false);
    }
  }

  async function signInWithApple(){
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ]
      });

      if(credential) {
        const name = credential.fullName!.givenName!;
        const userLogged = {
          id: String(credential.user),
          name,
          email: credential.email,
          photo: `https://ui-avatars.com/api/?name=${name}&length=1`
        };

        setUser(userLogged);
        await AsyncStorage.setItem(userStorageKey, JSON.stringify(userLogged));
      }
      
    } catch (error) {
      throw new Error(error);
    }
  }

  async function signOut() {
    setUser({} as User);
    await AsyncStorage.removeItem(userStorageKey);
  }

  useEffect(() => {
    async function loadUserStorageData() {
      const userStorage = await AsyncStorage.getItem(userStorageKey);

      if(userStorage) {
        const userLogged = JSON.parse(userStorage) as User;
        setUser(userLogged);
      }
      setUserStorageLoading(false);
    }

    loadUserStorageData();

  }, []);

  useEffect(() => {
    if(response?.type === 'success' && response.authentication?.accessToken) {
      signInWithGoogle(response.authentication.accessToken);
    } else if (userStorageLoading) {
      setUserStorageLoading(false);
    }
  }, [response]);

  return(
    <AuthContext.Provider value={{ 
      user, 
      signInWithGoogleRequest,
      signInWithApple,
      signOut,
      userStorageLoading
    }}>
      { children }
    </AuthContext.Provider>
  )
}

function useAuth(){
  const context = useContext(AuthContext);

  return context;
}

export { AuthProvider, useAuth }