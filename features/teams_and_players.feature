Feature: Teams and players

  Scenario: Add players to a team and assign a team to a game
    Given the player list contains "Jonas, Esmee, Floor, Floortje, Jarno, Kian, Thomas, Tess, Gita, Demi"
    And I create a team named "A Team"
    When I add players Jonas, Esmee and Floor to "A Team"
    And I assign "A Team" to game id 1
    Then game id 1 should have team "A Team" with members Jonas, Esmee, Floor

  Scenario: Add a new team member to the global list
    Given the player list contains "Jonas, Esmee"
    When I add a new player "Sofie" with gender "female"
    Then "Sofie" should be present in the player list

  Scenario: Player genders are recorded
    Given the player list contains:
      | name  | gender |
      | Jonas | male   |
      | Esmee | female |
    When I view player Jonas
    Then I should see his gender is "male"
