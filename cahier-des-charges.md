# To-Do List avec Bun

L'objectif est de développer une application To-Do List (Gestionnaire de Tâches) moderne, réactive et complète, en se concentrant sur une architecture minimaliste et efficace sans le poids d'un framework SPA traditionnel.

## Objectifs

- Mise en place un projet full-stack
- Maîtriser l'utilisation de Bun pour l'exécution, le bundling et les tests.
- Utiliser TypeScript sur le frontend et le backend pour la sécurité du type.
- Utiliser le paradigme HTMX pour l'interactivité sans JavaScript lourd.
- Interagir avec une base de données SQLite via le backend.Rédigé des tests unitaires critiques.
- Pratiquer le workflow Git/GitHub professionnel.

## Spécifications Techniques

## 1. Stack Technologique Imposée

- Runtime/Backend/Build Tool/Tests : Bun (avec son API Bun.serve et Bun Tests).
- Langage : TypeScript.
- Base de Données : SQLite (un ORM/Query Builder simple est mis à disposition).
- Frontend Interactivité : HTMX.
- Frontend JS Léger : Alpine.js (pour les besoins UI qui ne peuvent pas être gérés par HTMX seul, ex: gestion de modal/état local).
- Versionnement : Git et GitHub (branches + Pull Requests).

### 2. Fonctionnalités

#### Fonctionnalités minimales

1. Une tâche se définie par un titre, une description, un degré d'importance, une date de création, et un statut (en attente, en cours, terminée)
2. L'utilisateur doit pouvoir créer une tâche via un formulaire
3. L'utilisateur doit pouvoir consulter la liste des tâches et les trier selon le degré d'importance ou la date de création (utiliser HTMX)
4. L'utilisateur doit pouvoir supprimer une tâche depuis la liste (utiliser HTMX)
5. L'utilisateur doit pouvoir changer le statut d'une tâche en attente -> en cours -> terminée (utiliser HTMX, réaliser des tests unitaires)
6. Ajouter une représentation JSON de la liste de tâches lorsque l'URL se termine par ".json"
7. Ajouter une représentation CSV de la liste de tâches lorsque l'URL se termine par "CSV"
8. Ajouter une library CSS pour décorer l'application et la rendre plus conviviale

#### Fonctionnalités bonus

1. Édition de Tâche (HTMX & Alpine) : Passer du mode affichage au mode édition en cliquant sur le texte de la tâche (utiliser Alpine.js pour l'état d'édition si besoin, ou HTMX inline editing).
2. Filtrage (HTMX / Backend) : Ajout de boutons/liens pour filtrer les tâches : Toutes, Actives, Terminées.
3. Conteneurisation (Docker) : Créer un Dockerfile pour conteneuriser l'application Bun (y compris les dépendances et le build TypeScript) et l'exécuter dans un conteneur.

## Workflow et Exigences de Qualité

### 1. Git & GitHub

Les modifications doivent s'intégrer dans le workflow Git :

Branche Principale : main (stable, livrable).

Branches de Fonctionnalité : Créer une nouvelle branche pour chaque fonctionnalité ou correction de bug (ex: feat/add-task-form, fix/sql-insert-error).

Pull Requests (PR) : Toutes les modifications doivent passer par une PR sur GitHub, demandant une revue de code.

### 2. Code et Tests Unitaires

Sécurité des Types : L'utilisation de TypeScript est obligatoire pour le backend et la couche de données.

Lisibilité : Le code doit être clair, bien structuré (ex: séparation de la logique du serveur, de l'accès aux données, des vues HTML).

### 3. Documentation

Un fichier README.md doit être complété, décrivant le projet, la stack utilisée, et surtout les instructions pour installer et lancer le projet localement (y compris la commande Docker si le bonus est réalisé).
