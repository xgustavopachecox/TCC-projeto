package com.tcc.financas.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "Usuario")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(name = "pin_seguranca", nullable = false)
    private String pinSeguranca;

    // Construtores, Getters e Setters

    public Usuario() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getPinSeguranca() {
        return pinSeguranca;
    }

    public void setPinSeguranca(String pinSeguranca) {
        this.pinSeguranca = pinSeguranca;
    }
}
