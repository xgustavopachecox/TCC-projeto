import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../context/UserContext';

export default function Quiz() {
  const navigation = useNavigation<any>();
  const { setInvestorProfile, isFirstAccess, setIsFirstAccess } = useUser();
  
  const [quizStep, setQuizStep] = useState(0);
  const [points, setPoints] = useState(0);

  const PRIMARY_COLOR = '#6200ee';

  const questions = [
    {
      question: "Qual o seu nível de conhecimento sobre investimentos?",
      options: [
        { text: "Nenhum. Deixo tudo na poupança ou parado na conta.", value: 1 },
        { text: "Básico. Conheço Renda Fixa (CDB, Tesouro).", value: 2 },
        { text: "Avançado. Invisto em Ações, FIIs ou Criptomoedas.", value: 3 }
      ]
    },
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
        { text: "Proteger meu dinheiro da inflação sem correr riscos", value: 1 },
        { text: "Fazer meu patrimônio crescer aos poucos com risco moderado", value: 2 },
        { text: "Multiplicar meu dinheiro rapidamente, mesmo com alto risco", value: 3 }
      ]
    },
    {
      question: "Por quanto tempo você pretende deixar seu dinheiro investido?",
      options: [
        { text: "Menos de 1 ano (posso precisar do dinheiro a qualquer hora)", value: 1 },
        { text: "De 1 a 5 anos", value: 2 },
        { text: "Mais de 5 anos", value: 3 }
      ]
    },
    {
      question: "Qual parte da sua renda você costuma investir mensalmente?",
      options: [
        { text: "Não invisto ou menos de 5%", value: 1 },
        { text: "Entre 5% e 20%", value: 2 },
        { text: "Mais de 20%", value: 3 }
      ]
    }
  ];

  const handleFinish = (finalPoints: number) => {
    let pPerfil = 'Conservador';
    // Max points = 15. Min points = 5.
    // 5 a 8 = Conservador
    // 9 a 12 = Moderado
    // 13 a 15 = Arrojado
    if (finalPoints >= 13) pPerfil = 'Arrojado';
    else if (finalPoints >= 9) pPerfil = 'Moderado';

    setInvestorProfile(pPerfil);

    if (isFirstAccess) {
      setIsFirstAccess(false);
    } else {
      navigation.goBack();
    }
  };

  const handleSkip = () => {
    // Se pular, deixa Não definido e encerra onboarding
    if (isFirstAccess) {
      setIsFirstAccess(false);
    } else {
      navigation.goBack();
    }
  };

  const handleAnswer = (value: number) => {
    const newPoints = points + value;
    
    if (quizStep < questions.length - 1) {
      setPoints(newPoints);
      setQuizStep(quizStep + 1);
    } else {
      handleFinish(newPoints);
    }
  };

  const currentQ = questions[quizStep];
  const progress = ((quizStep + 1) / questions.length) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Perfil de Investidor</Text>
        {isFirstAccess && (
          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skipText}>Pular</Text>
          </TouchableOpacity>
        )}
        {!isFirstAccess && (
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={28} color="#333" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: PRIMARY_COLOR }]} />
      </View>
      <Text style={styles.stepText}>Pergunta {quizStep + 1} de {questions.length}</Text>

      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{currentQ.question}</Text>

        {currentQ.options.map((opt, idx) => (
          <TouchableOpacity 
            key={idx} 
            style={styles.optionButton}
            onPress={() => handleAnswer(opt.value)}
          >
            <Text style={styles.optionText}>{opt.text}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 10
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  },
  skipText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600'
  },
  progressContainer: {
    height: 6,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 20,
    borderRadius: 3,
    marginTop: 10,
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%',
    borderRadius: 3
  },
  stepText: {
    textAlign: 'center',
    marginTop: 10,
    color: '#888',
    fontWeight: '600'
  },
  questionContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40
  },
  questionText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 30
  },
  optionButton: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E4E9F2',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 15,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center'
  }
});
