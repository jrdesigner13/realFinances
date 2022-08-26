import React, { useContext, useState } from "react";
import { Alert, ActivityIndicator, Platform } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";

import { useAuth } from "../../hooks/auth"; 
import { useTheme } from "styled-components/native";
import {
  Container,
  Header,
  TitleWrapper,
  LogoTxt,
  Title,
  SignInTitle,
  Footer,
  FooterWrapper
} from './styles';

import AppleIcon from '../../assets/apple-icon.svg';
import GoogleIcon from '../../assets/google-icon.svg';
import LogoIcon from '../../assets/logo.svg';
import { SignInSocialButton } from "../../components/SignInSocialButton";


export function SignIn(){
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithGoogle, signInWithApple } = useAuth();
  const theme = useTheme();

  async function handleSignInWithGoogle() {
    try {
      setIsLoading(true);
      return await signInWithGoogle();

    } catch (error) {
      console.log(error);
      Alert.alert('Could not connect with google account');
      setIsLoading(false);
    } 
  }

  async function handleSignInWithApple() {
    try {
      setIsLoading(true);
      return await signInWithApple();
      
    } catch (error) {
      console.log(error);
      Alert.alert('Could not connect with apple account');
      setIsLoading(false);
    } 
  }

  return (
    <Container>
      <Header>
        <TitleWrapper>
          <LogoIcon
            width={RFValue(35)}
            height={RFValue(35)} 
          />
          <LogoTxt>Real Finances</LogoTxt>
          <Title>
            Control your {'\n'}
            finances in a {'\n'}
            very simple way {'\n'}
          </Title>
        </TitleWrapper>

        <SignInTitle>
          Log in with one of {'\n'}
          the accounts below
        </SignInTitle>
      </Header>
      <Footer>
        <FooterWrapper>
            <SignInSocialButton
              title="Sign In with Google"
              svg={GoogleIcon} 
              onPress={handleSignInWithGoogle}
            />
          {
            Platform.OS === 'ios' &&
            <SignInSocialButton
              title="Sign In with Apple"
              svg={AppleIcon} 
              onPress={handleSignInWithApple}
            />
          }
        </FooterWrapper>
        {isLoading && <ActivityIndicator 
          color={theme.colors.shape} 
          style={{ marginTop: 18 }}
        />}
      </Footer>
    </Container>
  );
}