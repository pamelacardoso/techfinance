import 'package:flutter/material.dart';
import 'app_bar/custom_app_bar.dart'; // Importa a AppBar personalizada

class HomeScreen extends StatelessWidget {
  final String usuario; // Nome do usuário (passado pelo login)

  const HomeScreen({super.key, required this.usuario});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CustomAppBar(
        usuario: usuario,
        onLogout: () {
          // Lógica para deslogar (navegar para a tela de login)
          Navigator.pushReplacementNamed(context, '/login');
        },
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: GridView.count(
          crossAxisCount: 2, // Número de colunas
          crossAxisSpacing: 16.0, // Espaço horizontal entre os quadrados
          mainAxisSpacing: 16.0, // Espaço vertical entre os quadrados
          children: [
            SizedBox(
              width: 80,
              height: 80,
              child: ElevatedButton(
                onPressed: () {
                  // Ação para produtos
                },
                child: const Text('Produtos'),
              ),
            ),
            SizedBox(
              width: 80,
              height: 80,
              child: ElevatedButton(
                onPressed: () {
                  // Ação para vendas
                },
                child: const Text('Vendas'),
              ),
            ),
            SizedBox(
              width: 80,
              height: 80,
              child: ElevatedButton(
                onPressed: () {
                  // Ação para clientes
                },
                child: const Text('Clientes'),
              ),
            ),
            SizedBox(
              width: 80,
              height: 80,
              child: ElevatedButton(
                onPressed: () {
                  // Ação para títulos
                },
                child: const Text('Títulos'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
