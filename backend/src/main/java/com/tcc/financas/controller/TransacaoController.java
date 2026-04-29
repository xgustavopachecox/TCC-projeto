package com.tcc.financas.controller;

import com.tcc.financas.model.Categoria;
import com.tcc.financas.model.Transacao;
import com.tcc.financas.model.Usuario;
import com.tcc.financas.repository.CategoriaRepository;
import com.tcc.financas.repository.TransacaoRepository;
import com.tcc.financas.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transacoes")
public class TransacaoController {

    @Autowired
    private TransacaoRepository repository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @GetMapping
    public List<Transacao> listarTodos(@RequestParam(required = false) Long usuarioId) {
        if (usuarioId != null) {
            return repository.findByUsuarioId(usuarioId);
        }
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Transacao> buscarPorId(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Transacao> criar(@RequestBody Transacao transacao) {
        if (transacao.getUsuario() != null && transacao.getUsuario().getId() != null) {
            Usuario usuario = usuarioRepository.findById(transacao.getUsuario().getId()).orElse(null);
            if (usuario == null) return ResponseEntity.badRequest().build();
            transacao.setUsuario(usuario);
        } else {
            return ResponseEntity.badRequest().build();
        }

        if (transacao.getCategoria() != null && transacao.getCategoria().getId() != null) {
            Categoria categoria = categoriaRepository.findById(transacao.getCategoria().getId()).orElse(null);
            if (categoria == null) return ResponseEntity.badRequest().build();
            transacao.setCategoria(categoria);
        } else {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(repository.save(transacao));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Transacao> atualizar(@PathVariable Long id, @RequestBody Transacao transacaoAtualizada) {
        return repository.findById(id)
                .map(transacao -> {
                    transacao.setTipo(transacaoAtualizada.getTipo());
                    transacao.setValor(transacaoAtualizada.getValor());
                    transacao.setData(transacaoAtualizada.getData());
                    transacao.setDescricao(transacaoAtualizada.getDescricao());

                    if (transacaoAtualizada.getCategoria() != null && transacaoAtualizada.getCategoria().getId() != null) {
                        categoriaRepository.findById(transacaoAtualizada.getCategoria().getId())
                                .ifPresent(transacao::setCategoria);
                    }

                    return ResponseEntity.ok(repository.save(transacao));
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
