package com.tcc.financas.controller;

import com.tcc.financas.model.Categoria;
import com.tcc.financas.model.Usuario;
import com.tcc.financas.repository.CategoriaRepository;
import com.tcc.financas.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
public class CategoriaController {

    @Autowired
    private CategoriaRepository repository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @GetMapping
    public List<Categoria> listarTodos(@RequestParam(required = false) Long usuarioId) {
        if (usuarioId != null) {
            return repository.findByUsuarioId(usuarioId);
        }
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Categoria> buscarPorId(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Categoria> criar(@RequestBody Categoria categoria) {
        if (categoria.getUsuario() != null && categoria.getUsuario().getId() != null) {
            Usuario usuario = usuarioRepository.findById(categoria.getUsuario().getId()).orElse(null);
            if (usuario == null) return ResponseEntity.badRequest().build();
            categoria.setUsuario(usuario);
        } else {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(repository.save(categoria));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Categoria> atualizar(@PathVariable Long id, @RequestBody Categoria categoriaAtualizada) {
        return repository.findById(id)
                .map(categoria -> {
                    categoria.setNome(categoriaAtualizada.getNome());
                    categoria.setTipo(categoriaAtualizada.getTipo());
                    return ResponseEntity.ok(repository.save(categoria));
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
