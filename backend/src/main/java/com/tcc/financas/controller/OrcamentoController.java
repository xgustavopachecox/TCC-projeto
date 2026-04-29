package com.tcc.financas.controller;

import com.tcc.financas.model.Categoria;
import com.tcc.financas.model.Orcamento;
import com.tcc.financas.model.Usuario;
import com.tcc.financas.repository.CategoriaRepository;
import com.tcc.financas.repository.OrcamentoRepository;
import com.tcc.financas.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orcamentos")
public class OrcamentoController {

    @Autowired
    private OrcamentoRepository repository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @GetMapping
    public List<Orcamento> listarTodos(@RequestParam(required = false) Long usuarioId) {
        if (usuarioId != null) {
            return repository.findByUsuarioId(usuarioId);
        }
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Orcamento> buscarPorId(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Orcamento> criar(@RequestBody Orcamento orcamento) {
        if (orcamento.getUsuario() != null && orcamento.getUsuario().getId() != null) {
            Usuario usuario = usuarioRepository.findById(orcamento.getUsuario().getId()).orElse(null);
            if (usuario == null) return ResponseEntity.badRequest().build();
            orcamento.setUsuario(usuario);
        } else {
            return ResponseEntity.badRequest().build();
        }

        if (orcamento.getCategoria() != null && orcamento.getCategoria().getId() != null) {
            Categoria categoria = categoriaRepository.findById(orcamento.getCategoria().getId()).orElse(null);
            if (categoria == null) return ResponseEntity.badRequest().build();
            orcamento.setCategoria(categoria);
        } else {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(repository.save(orcamento));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Orcamento> atualizar(@PathVariable Long id, @RequestBody Orcamento orcamentoAtualizado) {
        return repository.findById(id)
                .map(orcamento -> {
                    orcamento.setLimiteValor(orcamentoAtualizado.getLimiteValor());
                    orcamento.setMesAno(orcamentoAtualizado.getMesAno());

                    if (orcamentoAtualizado.getCategoria() != null && orcamentoAtualizado.getCategoria().getId() != null) {
                        categoriaRepository.findById(orcamentoAtualizado.getCategoria().getId())
                                .ifPresent(orcamento::setCategoria);
                    }

                    return ResponseEntity.ok(repository.save(orcamento));
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
