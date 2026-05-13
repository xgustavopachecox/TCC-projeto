package com.tcc.financas.service;

import com.tcc.financas.model.Transacao;
import com.tcc.financas.model.TransacaoRecorrente;
import com.tcc.financas.repository.TransacaoRecorrenteRepository;
import com.tcc.financas.repository.TransacaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class RecorrenciaService {

    @Autowired
    private TransacaoRecorrenteRepository recorrenteRepository;

    @Autowired
    private TransacaoRepository transacaoRepository;

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    @Transactional
    public void processarRecorrenciasPendentes(Long usuarioId) {
        List<TransacaoRecorrente> recorrentes = recorrenteRepository.findByUsuarioIdAndStatus(usuarioId, "ATIVA");
        LocalDate hoje = LocalDate.now();

        for (TransacaoRecorrente rec : recorrentes) {
            LocalDate proximaData;
            try {
                proximaData = LocalDate.parse(rec.getProximaData(), FORMATTER);
            } catch (Exception e) {
                continue; // Pular se a data for inválida
            }

            // Enquanto a proximaData for menor ou igual a hoje, gera a transação e avança a data
            while (!proximaData.isAfter(hoje)) {
                // 1. Criar transação real
                Transacao novaTx = new Transacao();
                novaTx.setTipo(rec.getTipo());
                novaTx.setValor(rec.getValor());
                novaTx.setDescricao(rec.getDescricao() + " (Automático)");
                novaTx.setData(proximaData.format(FORMATTER));
                novaTx.setUsuario(rec.getUsuario());
                novaTx.setCategoria(rec.getCategoria());
                
                transacaoRepository.save(novaTx);

                // 2. Avançar a próxima data baseada na frequência
                switch (rec.getFrequencia().toUpperCase()) {
                    case "DIARIA":
                        proximaData = proximaData.plusDays(1);
                        break;
                    case "SEMANAL":
                        proximaData = proximaData.plusWeeks(1);
                        break;
                    case "MENSAL":
                        proximaData = proximaData.plusMonths(1);
                        break;
                    default:
                        // Prevenir loop infinito se frequência for inválida
                        proximaData = hoje.plusDays(1);
                        break;
                }
            }

            // 3. Atualiza a assinatura com a nova proximaData (que agora será no futuro)
            rec.setProximaData(proximaData.format(FORMATTER));
            recorrenteRepository.save(rec);
        }
    }
}
