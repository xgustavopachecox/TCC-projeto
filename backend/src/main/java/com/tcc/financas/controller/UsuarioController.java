package com.tcc.financas.controller;

import com.tcc.financas.model.Usuario;
import com.tcc.financas.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.transaction.annotation.Transactional;
import com.tcc.financas.repository.CategoriaRepository;
import com.tcc.financas.repository.MetaRepository;
import com.tcc.financas.repository.OrcamentoRepository;
import com.tcc.financas.repository.PerfilInvestidorRepository;
import com.tcc.financas.repository.TransacaoRepository;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioRepository repository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private MetaRepository metaRepository;

    @Autowired
    private OrcamentoRepository orcamentoRepository;

    @Autowired
    private PerfilInvestidorRepository perfilInvestidorRepository;

    @Autowired
    private TransacaoRepository transacaoRepository;

    @GetMapping
    public List<Usuario> listarTodos() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Usuario> buscarPorId(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Usuario criar(@RequestBody Usuario usuario) {
        return repository.save(usuario);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Usuario> atualizar(@PathVariable Long id, @RequestBody Usuario usuarioAtualizado) {
        return repository.findById(id)
                .map(usuario -> {
                    usuario.setNome(usuarioAtualizado.getNome());
                    usuario.setPinSeguranca(usuarioAtualizado.getPinSeguranca());
                    if (usuarioAtualizado.getDataNascimento() != null) {
                        usuario.setDataNascimento(usuarioAtualizado.getDataNascimento());
                    }
                    if (usuarioAtualizado.getSalarioAtual() != null) {
                        usuario.setSalarioAtual(usuarioAtualizado.getSalarioAtual());
                    }
                    return ResponseEntity.ok(repository.save(usuario));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @Transactional
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        if (repository.existsById(id)) {
            // Exclui todas as dependências do usuário primeiro
            transacaoRepository.deleteAll(transacaoRepository.findByUsuarioId(id));
            metaRepository.deleteAll(metaRepository.findByUsuarioId(id));
            orcamentoRepository.deleteAll(orcamentoRepository.findByUsuarioId(id));
            categoriaRepository.deleteAll(categoriaRepository.findByUsuarioId(id));
            
            perfilInvestidorRepository.findByUsuarioId(id).ifPresent(perfilInvestidorRepository::delete);

            // Exclui o próprio usuário
            repository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
