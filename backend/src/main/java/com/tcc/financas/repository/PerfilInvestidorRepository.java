package com.tcc.financas.repository;

import com.tcc.financas.model.PerfilInvestidor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PerfilInvestidorRepository extends JpaRepository<PerfilInvestidor, Long> {
    Optional<PerfilInvestidor> findByUsuarioId(Long usuarioId);
}
