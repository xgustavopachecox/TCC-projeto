package com.tcc.financas.controller;

import com.tcc.financas.model.Meta;
import com.tcc.financas.model.Usuario;
import com.tcc.financas.repository.MetaRepository;
import com.tcc.financas.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/metas")
public class MetaController {

    @Autowired
    private MetaRepository repository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @GetMapping
    public List<Meta> listarTodos(@RequestParam(required = false) Long usuarioId) {
        if (usuarioId != null) {
            return repository.findByUsuarioId(usuarioId);
        }
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Meta> buscarPorId(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Meta> criar(@RequestBody Meta meta) {
        if (meta.getUsuario() != null && meta.getUsuario().getId() != null) {
            Usuario usuario = usuarioRepository.findById(meta.getUsuario().getId()).orElse(null);
            if (usuario == null) return ResponseEntity.badRequest().build();
            meta.setUsuario(usuario);
        } else {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(repository.save(meta));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Meta> atualizar(@PathVariable Long id, @RequestBody Meta metaAtualizada) {
        return repository.findById(id)
                .map(meta -> {
                    meta.setNome(metaAtualizada.getNome());
                    meta.setValorAlvo(metaAtualizada.getValorAlvo());
                    meta.setValorAtual(metaAtualizada.getValorAtual());
                    meta.setPrazo(metaAtualizada.getPrazo());
                    return ResponseEntity.ok(repository.save(meta));
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
