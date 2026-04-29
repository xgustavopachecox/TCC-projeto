package com.tcc.financas.controller;

import com.tcc.financas.model.PerfilInvestidor;
import com.tcc.financas.model.Usuario;
import com.tcc.financas.repository.PerfilInvestidorRepository;
import com.tcc.financas.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/perfis")
public class PerfilInvestidorController {

    @Autowired
    private PerfilInvestidorRepository repository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @GetMapping
    public List<PerfilInvestidor> listarTodos() {
        return repository.findAll();
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<PerfilInvestidor> buscarPorUsuarioId(@PathVariable Long usuarioId) {
        return repository.findByUsuarioId(usuarioId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PerfilInvestidor> buscarPorId(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<PerfilInvestidor> criar(@RequestBody PerfilInvestidor perfil) {
        if (perfil.getUsuario() != null && perfil.getUsuario().getId() != null) {
            Usuario usuario = usuarioRepository.findById(perfil.getUsuario().getId()).orElse(null);
            if (usuario == null) return ResponseEntity.badRequest().build();
            perfil.setUsuario(usuario);
        } else {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(repository.save(perfil));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PerfilInvestidor> atualizar(@PathVariable Long id, @RequestBody PerfilInvestidor perfilAtualizado) {
        return repository.findById(id)
                .map(perfil -> {
                    perfil.setTipoPerfil(perfilAtualizado.getTipoPerfil());
                    perfil.setDataAnalise(perfilAtualizado.getDataAnalise());
                    return ResponseEntity.ok(repository.save(perfil));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
