import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  TextInput,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import { useTransactions } from '../context/TransactionContext';

type Message = {
  id: string;
  role: 'ai' | 'user';
  text: string;
};

export default function Advisor() {
  const { userName, investorProfile, setInvestorProfile } = useUser();
  const { transactions } = useTransactions();
  
  // Quiz State
  const [quizStep, setQuizStep] = useState(0);
  const [points, setPoints] = useState(0);

  // Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const PRIMARY_COLOR = '#6200ee';

  // --- QUIZ DATA ---
  const questions = [
    {
      question: "O que você faria se seus investimentos caíssem 20% em um mês?",
      options: [
        { text: "Venderia tudo desesperadamente", value: 1 },
        { text: "Aguardaria o mercado se recuperar", value: 2 },
        { text: "Compraria mais aproveitando a queda", value: 3 }
      ]
    },
    {
      question: "Qual o seu principal objetivo ao investir?",
      options: [
        { text: "Proteger meu dinheiro da inflação", value: 1 },
        { text: "Fazer meu patrimônio crescer aos poucos", value: 2 },
        { text: "Multiplicar meu dinheiro rapidamente", value: 3 }
      ]
    },
    {
      question: "Por quanto tempo você pretende deixar seu dinheiro investido?",
      options: [
        { text: "Menos de 1 ano (posso precisar do dinheiro)", value: 1 },
        { text: "De 1 a 5 anos", value: 2 },
        { text: "Mais de 5 anos", value: 3 }
      ]
    }
  ];

  const handleAnswer = (value: number) => {
    const newPoints = points + value;
    setPoints(newPoints);

    if (quizStep < questions.length - 1) {
      setQuizStep(quizStep + 1);
    } else {
      // Determinar Perfil e Salvar
      let pPerfil = 'Conservador';
      if (newPoints >= 7) pPerfil = 'Arrojado';
      else if (newPoints >= 5) pPerfil = 'Moderado';

      setInvestorProfile(pPerfil);
      iniciarChat(pPerfil);
    }
  };

  // --- CHAT INITIALIZATION ---
  const iniciarChat = (perfil: string) => {
    // Calculo básico do mês para a IA comentar
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

    const aiInitialMsg = {
      id: Math.random().toString(),
      role: 'ai' as const,
      text: `Olá ${userName}! Sou a TCC-AI ✨. \n\nAcabei de analisar que seu perfil é ${perfil}. Baseado nisso, posso te ajudar a escolher investimentos ideais ou analisar seus gastos. \n\nNo momento vi que você gastou R$ ${despesas.toFixed(2)} este mês. Como posso te ajudar hoje?`
    };
    setMessages([aiInitialMsg]);
  };

  useEffect(() => {
    if (investorProfile === 'Não definido') {
      setQuizStep(0);
      setPoints(0);
      setMessages([]);
    } else if (messages.length === 0) {
      iniciarChat(investorProfile);
    }
  }, [investorProfile]);

  const sendMessage = () => {
    if (!inputText.trim()) return;

    const userMsg: Message = { id: Math.random().toString(), role: 'user', text: inputText };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Rola pra baixo
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

    // Simula tempo de resposta da IA
    setTimeout(() => {
      let aiText = "Estou processando sua solicitação...";
      
      const lowerInput = userMsg.text.toLowerCase();
      if (lowerInput.includes('resumo') || lowerInput.includes('gasto')) {
        aiText = "Aqui está o resumo: Tente focar em reduzir gastos na categoria Alimentação e Transporte. Posso gerar um gráfico completo na tela de Início para você.";
      } else if (lowerInput.includes('investir') || lowerInput.includes('ativo') || lowerInput.includes('recomend')) {
        if (investorProfile === 'Conservador') {
          aiText = "Para o seu perfil Conservador, eu recomendo Títulos do Tesouro Direto (Tesouro Selic) ou CDBs com liquidez diária. Risco baixo e protegem da inflação.";
        } else if (investorProfile === 'Moderado') {
          aiText = "Como Moderado, você pode mesclar: 70% em Tesouro/CDBs e 30% em Fundos Imobiliários (FIIs) para começar a receber dividendos!";
        } else {
          aiText = "Perfil Arrojado detectado! Recomendo uma diversificação agressiva: 50% Ações, 30% Fundos Imobiliários e 20% em Criptomoedas ou Ativos Internacionais.";
        }
      } else {
        aiText = `Entendi. Como um investidor ${investorProfile}, mantenha o foco no longo prazo. Se quiser dicas de ativos ou o resumo do mês, é só pedir!`;
      }

      setMessages(prev => [...prev, { id: Math.random().toString(), role: 'ai', text: aiText }]);
      setIsTyping(false);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

    }, 2000);
  };

  // --- RENDERIZAÇÃO: MODO QUIZ ---
  if (investorProfile === 'Não definido') {
    return (
      <View style={styles.container}>
        <View style={styles.headerQuiz}>
          <Ionicons name="sparkles" size={40} color="#FFF" style={{marginBottom: 10}} />
          <Text style={styles.titleQuiz}>Bem-vindo à TCC-AI</Text>
          <Text style={styles.subtitleQuiz}>Para eu te dar dicas personalizadas sobre ativos e finanças, preciso entender seu Perfil de Investidor.</Text>
        </View>

        <View style={styles.quizCard}>
          <Text style={styles.quizCount}>Pergunta {quizStep + 1} de {questions.length}</Text>
          <Text style={styles.questionText}>{questions[quizStep].question}</Text>

          {questions[quizStep].options.map((opt, idx) => (
            <TouchableOpacity key={idx} style={styles.optionButton} onPress={() => handleAnswer(opt.value)}>
              <Text style={styles.optionText}>{opt.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  // --- RENDERIZAÇÃO: MODO CHAT IA ---
  return (
    <KeyboardAvoidingView style={styles.containerChat} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.chatHeader}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
          <View style={styles.aiAvatar}>
            <Ionicons name="sparkles" size={20} color="#FFF" />
          </View>
          <View>
            <Text style={styles.chatTitle}>I.A Advisor</Text>
            <Text style={styles.chatSubtitle}>Perfil detectado: {investorProfile}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => { setInvestorProfile('Não definido'); setQuizStep(0); setPoints(0); setMessages([]); }}>
          <Ionicons name="refresh" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.chatBody} 
        ref={scrollViewRef} 
        contentContainerStyle={{paddingVertical: 20}}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => {
          const isAI = msg.role === 'ai';
          return (
            <View key={msg.id} style={[styles.messageWrapper, isAI ? styles.messageWrapperAI : styles.messageWrapperUser]}>
              {isAI && <Ionicons name="sparkles-outline" size={16} color={PRIMARY_COLOR} style={{marginRight: 6, alignSelf: 'flex-end', marginBottom: 5}}/>}
              <View style={[styles.bubble, isAI ? styles.aiBubble : styles.userBubble]}>
                <Text style={[styles.bubbleText, isAI ? styles.aiBubbleText : styles.userBubbleText]}>{msg.text}</Text>
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
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Ionicons name="send" size={18} color="#FFF" style={{marginLeft: 2}} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#6200ee' },
  headerQuiz: { paddingTop: 80, paddingHorizontal: 30, alignItems: 'center' },
  titleQuiz: { fontSize: 26, fontWeight: 'bold', color: '#FFF', marginBottom: 10, textAlign: 'center' },
  subtitleQuiz: { fontSize: 16, color: '#E0E0E0', textAlign: 'center', lineHeight: 22 },
  quizCard: { backgroundColor: '#FFF', flex: 1, marginTop: 40, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 30, elevation: 10 },
  quizCount: { color: '#6200ee', fontWeight: 'bold', textTransform: 'uppercase', fontSize: 12, marginBottom: 10 },
  questionText: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 30, lineHeight: 28 },
  optionButton: { backgroundColor: '#F8F9FA', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 15, padding: 20, marginBottom: 15 },
  optionText: { fontSize: 16, color: '#444', fontWeight: '500' },

  containerChat: { flex: 1, backgroundColor: '#F2F4F7', paddingBottom: 90 /* height of nav bar */ },
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
  
  inputArea: { flexDirection: 'row', padding: 15, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#EEE', alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#F5F5F5', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 25, fontSize: 15, color: '#333', marginRight: 10 },
  sendButton: { width: 45, height: 45, backgroundColor: '#6200ee', borderRadius: 23, justifyContent: 'center', alignItems: 'center' }
});
