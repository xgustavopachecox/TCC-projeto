package com.tcc.financas.model;

import jakarta.persistence.*;

@Entity
@Table(name = "Perfil_Investidor")
public class PerfilInvestidor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tipo_perfil", nullable = false)
    private String tipoPerfil;

    @Column(name = "data_analise", nullable = false)
    private String dataAnalise;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false, unique = true)
    private Usuario usuario;

    public PerfilInvestidor() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTipoPerfil() {
        return tipoPerfil;
    }

    public void setTipoPerfil(String tipoPerfil) {
        this.tipoPerfil = tipoPerfil;
    }

    public String getDataAnalise() {
        return dataAnalise;
    }

    public void setDataAnalise(String dataAnalise) {
        this.dataAnalise = dataAnalise;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }
}
