package com.tcc.financas.controller;

import com.tcc.financas.model.Categoria;
import com.tcc.financas.model.TransacaoRecorrente;
import com.tcc.financas.model.Usuario;
import com.tcc.financas.repository.CategoriaRepository;
import com.tcc.financas.repository.TransacaoRecorrenteRepository;
import com.tcc.financas.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recorrentes")
public class TransacaoRecorrenteController {

    @Autowired
    private TransacaoRecorrenteRepository repository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @GetMapping
    public List<TransacaoRecorrente> listarTodos(@RequestParam Long usuarioId) {
        return repository.findByUsuarioIdAndStatus(usuarioId, "ATIVA");
    }

    @PostMapping
    public ResponseEntity<TransacaoRecorrente> criar(@RequestBody TransacaoRecorrente recorrente) {
        if (recorrente.getUsuario() != null && recorrente.getUsuario().getId() != null) {
            Usuario usuario = usuarioRepository.findById(recorrente.getUsuario().getId()).orElse(null);
            if (usuario == null) return ResponseEntity.badRequest().build();
            recorrente.setUsuario(usuario);
        } else {
            return ResponseEntity.badRequest().build();
        }

        if (recorrente.getCategoria() != null && recorrente.getCategoria().getId() != null) {
            Categoria categoria = categoriaRepository.findById(recorrente.getCategoria().getId()).orElse(null);
            if (categoria == null) return ResponseEntity.badRequest().build();
            recorrente.setCategoria(categoria);
        } else {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(repository.save(recorrente));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        return repository.findById(id).map(rec -> {
            rec.setStatus("INATIVA"); // Exclusão lógica para não apagar histórico referencial, ou podemos deletar físico
            repository.save(rec);
            return ResponseEntity.noContent().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
