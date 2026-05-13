package com.tcc.financas.repository;

import com.tcc.financas.model.TransacaoRecorrente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransacaoRecorrenteRepository extends JpaRepository<TransacaoRecorrente, Long> {
    List<TransacaoRecorrente> findByUsuarioId(Long usuarioId);
    List<TransacaoRecorrente> findByUsuarioIdAndStatus(Long usuarioId, String status);
}
