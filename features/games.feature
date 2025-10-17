Feature: Manage games

  Background:
    Given the following players exist:
      | name     | gender |
      | Jonas    | male   |
      | Esmee    | female |
      | Floor    | female |
      | Floortje | female |
      | Jarno    | male   |
      | Kian     | male   |
      | Thomas   | male   |
      | Tess     | female |
      | Gita     | female |
      | Demi     | female |

  Scenario: Create a new game and store metadata
    When I create a new game with:
      | opponent     | Home |
      | date         | 2025-10-18 |
    Then the game should be saved with opponent "Home" and date "2025-10-18"

  Scenario: Edit an existing game
    Given a game exists with id 1 and opponent "Team B" and date "2025-10-01"
    When I update the game's opponent to "Team C"
    Then the game with id 1 should have opponent "Team C"

  Scenario: Create a new game copying previous team members
    Given a previous game exists with id 2 and team members Jonas, Esmee, Floor
    When I create a new game copying team from game id 2
    Then the new game should have team members Jonas, Esmee, Floor
