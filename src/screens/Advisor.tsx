import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  TextInput,
  Platform,
  KeyboardAvoidingView,
  Modal,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Markdown from 'react-native-markdown-display';
import { useUser } from '../context/UserContext';
import { useTransactions } from '../context/TransactionContext';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

type Message = {
  id: string;
  role: 'ai' | 'user';
  text: string;
};

export default function Advisor() {
  const navigation = useNavigation<any>();
  const { userId, userName, investorProfile, setInvestorProfile, userSalary } = useUser();
  const { transactions } = useTransactions();
  
  // Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasAgreedDisclaimer, setHasAgreedDisclaimer] = useState<boolean | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const PRIMARY_COLOR = '#6200ee';

  useEffect(() => {
    const checkDisclaimer = async () => {
      if (!userId) return;
      const agreed = await AsyncStorage.getItem(`@agreedToAIDisclaimer_${userId}`);
      setHasAgreedDisclaimer(agreed === 'true');
    };
    checkDisclaimer();
  }, [userId]);

  const handleAgreeDisclaimer = async () => {
    if (!userId) return;
    await AsyncStorage.setItem(`@agreedToAIDisclaimer_${userId}`, 'true');
    setHasAgreedDisclaimer(true);
  };

  // --- CHAT INITIALIZATION ---
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isTyping) return;

    const userMsg: Message = { id: Math.random().toString(), role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Rola pra baixo
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

    if (!apiKey) {
      setMessages(prev => [...prev, { id: Math.random().toString(), role: 'ai', text: "A chave da API do Gemini não foi encontrada. Configure o arquivo .env com a chave EXPO_PUBLIC_GEMINI_API_KEY." }]);
      setIsTyping(false);
      return;
    }

    // Calcular resumo de despesas do mês
    const hoje = new Date();
    const transacoesMes = transactions.filter(tx => {
      const [d, m, y] = tx.date.split('/');
      return parseInt(m) === hoje.getMonth() + 1 && parseInt(y) === hoje.getFullYear();
    });

    let despesas = 0;
    transacoesMes.forEach(tx => {
      if (tx.type === 'down') {
        let val = parseFloat(tx.amount.replace(/\./g, '').replace(',', '.'));
        despesas += val || 0;
      }
    });

    const systemInstruction = `Você é a IA de um aplicativo de Finanças, uma conselheira financeira inteligente do aplicativo TCC Finanças.
Seu objetivo é ajudar o usuário exclusivamente com finanças pessoais, economia e investimentos.
Dados do usuário atual:
- Nome: ${userName}
- Perfil de Investidor: ${investorProfile}
${userSalary ? `- Salário Atual: R$ ${userSalary}` : ''}
- Gastos deste mês: R$ ${despesas.toFixed(2)}

Regras cruciais:
1. Responda APENAS sobre finanças. Se o usuário perguntar sobre outros assuntos, recuse educadamente.
2. Seja amigável, direto e use emojis ocasionalmente.
3. Leve sempre em consideração o perfil de investidor e o salário do usuário ao dar dicas.
4. Formate a resposta em parágrafos ou tópicos curtos, fáceis de ler no celular.`;

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", systemInstruction });
      
      const chatHistory = messages.map(m => ({
        role: m.role === 'ai' ? 'model' : 'user',
        parts: [{ text: m.text }]
      }));
      
      const chatSession = model.startChat({ history: chatHistory });
      const result = await chatSession.sendMessage(textToSend);
      const aiText = result.response.text();
      
      setMessages(prev => [...prev, { id: Math.random().toString(), role: 'ai', text: aiText }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { id: Math.random().toString(), role: 'ai', text: "Ocorreu um erro ao consultar a inteligência artificial. Verifique se sua chave da API é válida." }]);
    } finally {
      setIsTyping(false);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  // --- RENDERIZAÇÃO: MODO BLOQUEADO ---
  if (investorProfile === 'Não definido') {
    return (
      <View style={styles.container}>
        <View style={styles.headerQuiz}>
          <Ionicons name="sparkles" size={60} color="#FFF" style={{marginBottom: 20}} />
          <Text style={styles.titleQuiz}>Bem-vindo à TCC-AI</Text>
          <Text style={styles.subtitleQuiz}>
            Para desbloquear a inteligência artificial e receber dicas personalizadas sobre ativos e finanças, preciso entender o seu Perfil de Investidor.
          </Text>
        </View>

        <View style={styles.quizCard}>
          <TouchableOpacity style={styles.startQuizButton} onPress={() => navigation.navigate('Quiz')}>
            <Text style={styles.startQuizButtonText}>Traçar meu Perfil de Investidor</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // --- RENDERIZAÇÃO: MODO DISCLAIMER ---
  if (hasAgreedDisclaimer === false) {
    return (
      <View style={styles.container}>
        <View style={styles.headerQuiz}>
          <Ionicons name="shield-checkmark" size={60} color="#FFF" style={{marginBottom: 20}} />
          <Text style={styles.titleQuiz}>Aviso de Privacidade</Text>
          <Text style={styles.subtitleQuiz}>
            Nossa Inteligência Artificial é alimentada pelo Google Gemini.
            Ao prosseguir, você concorda que o seu perfil de investidor e o saldo de gastos do mês serão compartilhados com os servidores do Google para gerar análises personalizadas.
          </Text>
        </View>

        <View style={styles.quizCard}>
          <TouchableOpacity style={[styles.startQuizButton, { width: '100%', justifyContent: 'center', marginBottom: 15 }]} onPress={handleAgreeDisclaimer}>
            <Ionicons name="checkmark-circle" size={20} color="#FFF" />
            <Text style={styles.startQuizButtonText}>Li e Concordo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.startQuizButton, { width: '100%', justifyContent: 'center', backgroundColor: '#F5F5F5', elevation: 0, shadowOpacity: 0 }]} onPress={() => navigation.navigate('Início')}>
            <Ionicons name="close-circle" size={20} color="#666" />
            <Text style={[styles.startQuizButtonText, { color: '#666' }]}>Recusar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (hasAgreedDisclaimer === null) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FFF" />
      </View>
    );
  }

  // --- RENDERIZAÇÃO: MODO CHAT IA ---
  return (
    <View style={styles.containerChat}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Modal visible={isTyping} transparent={true} animationType="fade">
        <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center'}}>
          <View style={{backgroundColor: '#FFF', padding: 25, borderRadius: 20, alignItems: 'center', elevation: 10}}>
            <ActivityIndicator size="large" color="#6200ee" />
            <Text style={{marginTop: 15, color: '#333', fontWeight: 'bold'}}>I.A pensando...</Text>
          </View>
        </View>
      </Modal>

      <View style={styles.chatHeader}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
          <View style={styles.aiAvatar}>
            <Ionicons name="sparkles" size={20} color="#FFF" />
          </View>
          <View>
            <Text style={styles.chatTitle}>I.A Investidora</Text>
            <Text style={styles.chatSubtitle}>Perfil detectado: {investorProfile}</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.chatBody} 
        ref={scrollViewRef} 
        contentContainerStyle={{paddingVertical: 20}}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 && (
          <View style={styles.initialPromptsContainer}>
            <Text style={styles.initialPromptsTitle}>Como posso te ajudar hoje, {userName}?</Text>
            
            <TouchableOpacity style={styles.promptButton} onPress={() => handleSendMessage("Faça um resumo dos meus gastos deste mês.")}>
              <Ionicons name="pie-chart-outline" size={24} color={PRIMARY_COLOR} />
              <Text style={styles.promptButtonText}>Resumo dos meus gastos</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.promptButton} onPress={() => handleSendMessage("Quais as melhores opções de investimento para mim?")}>
              <Ionicons name="trending-up-outline" size={24} color={PRIMARY_COLOR} />
              <Text style={styles.promptButtonText}>Dicas de investimento</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.promptButton} onPress={() => handleSendMessage("Como posso melhorar meu planejamento financeiro?")}>
              <Ionicons name="wallet-outline" size={24} color={PRIMARY_COLOR} />
              <Text style={styles.promptButtonText}>Melhorar planejamento</Text>
            </TouchableOpacity>
          </View>
        )}

        {messages.map((msg) => {
          const isAI = msg.role === 'ai';
          return (
            <View key={msg.id} style={[styles.messageWrapper, isAI ? styles.messageWrapperAI : styles.messageWrapperUser]}>
              {isAI && <Ionicons name="sparkles-outline" size={16} color={PRIMARY_COLOR} style={{marginRight: 6, alignSelf: 'flex-end', marginBottom: 5}}/>}
              <View style={[styles.bubble, isAI ? styles.aiBubble : styles.userBubble]}>
                {isAI ? (
                  <Markdown style={markdownStyles}>
                    {msg.text}
                  </Markdown>
                ) : (
                  <Text style={[styles.bubbleText, styles.userBubbleText]}>{msg.text}</Text>
                )}
              </View>
            </View>
          )
        })}

        {isTyping && (
          <View style={[styles.messageWrapper, styles.messageWrapperAI]}>
             <Ionicons name="sparkles" size={16} color={PRIMARY_COLOR} style={{marginRight: 6}}/>
             <View style={[styles.bubble, styles.aiBubble, { paddingHorizontal: 20 }]}>
                <Text style={styles.typingText}>A pensar...</Text>
             </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputArea}>
        <TextInput 
          style={styles.input} 
          placeholder="Peça dicas de ativos ou resumos..." 
          placeholderTextColor="#999" 
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={() => handleSendMessage(inputText)}
        />
        <TouchableOpacity style={styles.sendButton} onPress={() => handleSendMessage(inputText)}>
          <Ionicons name="send" size={18} color="#FFF" style={{marginLeft: 2}} />
        </TouchableOpacity>
      </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#6200ee' },
  headerQuiz: { paddingTop: 100, paddingHorizontal: 30, alignItems: 'center' },
  titleQuiz: { fontSize: 28, fontWeight: 'bold', color: '#FFF', marginBottom: 15, textAlign: 'center' },
  subtitleQuiz: { fontSize: 16, color: '#E0E0E0', textAlign: 'center', lineHeight: 24 },
  quizCard: { backgroundColor: '#FFF', flex: 1, marginTop: 40, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 30, elevation: 10, justifyContent: 'center', alignItems: 'center' },
  startQuizButton: { flexDirection: 'row', backgroundColor: '#6200ee', paddingVertical: 18, paddingHorizontal: 25, borderRadius: 20, alignItems: 'center', gap: 10, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5 },
  startQuizButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },

  containerChat: { flex: 1, backgroundColor: '#F2F4F7', marginBottom: 90 /* height of nav bar */ },
  chatHeader: { backgroundColor: '#6200ee', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomLeftRadius: 20, borderBottomRightRadius: 20, elevation: 5 },
  aiAvatar: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  chatTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  chatSubtitle: { color: '#E0E0E0', fontSize: 13, marginTop: 2 },
  
  chatBody: { flex: 1, paddingHorizontal: 15 },
  messageWrapper: { flexDirection: 'row', marginBottom: 20, maxWidth: '85%' },
  messageWrapperAI: { alignSelf: 'flex-start', alignItems: 'flex-end' },
  messageWrapperUser: { alignSelf: 'flex-end' },
  
  bubble: { padding: 15, borderRadius: 20, elevation: 1 },
  aiBubble: { backgroundColor: '#FFF', borderBottomLeftRadius: 5 },
  userBubble: { backgroundColor: '#6200ee', borderBottomRightRadius: 5 },
  
  bubbleText: { fontSize: 15, lineHeight: 22 },
  aiBubbleText: { color: '#333' },
  userBubbleText: { color: '#FFF' },

  typingText: { color: '#888', fontStyle: 'italic', fontSize: 14 },
  
  initialPromptsContainer: { marginTop: 30, paddingHorizontal: 10 },
  initialPromptsTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 20, textAlign: 'center' },
  promptButton: { flexDirection: 'row', backgroundColor: '#FFF', padding: 15, borderRadius: 15, marginBottom: 12, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4 },
  promptButtonText: { marginLeft: 12, fontSize: 15, color: '#444', fontWeight: '500', flex: 1 },

  inputArea: { flexDirection: 'row', padding: 15, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#EEE', alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#F5F5F5', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 25, fontSize: 15, color: '#333', marginRight: 10 },
  sendButton: { width: 45, height: 45, backgroundColor: '#6200ee', borderRadius: 23, justifyContent: 'center', alignItems: 'center' }
});

const markdownStyles = {
  body: { color: '#333', fontSize: 15, lineHeight: 22 },
  strong: { fontWeight: 'bold' as const },
  paragraph: { marginTop: 0, marginBottom: 10 }
};
