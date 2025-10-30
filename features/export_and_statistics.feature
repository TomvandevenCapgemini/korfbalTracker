Feature: Export and Statistics
  As a user, I want to manage games, teams, and events efficiently, so that I can track and analyze statistics.

  Background:
    Given multiple games exist with logged events

  Scenario: Export a single game's data to Excel
    When I export game id 1 to Excel
    Then the exported file should contain:
      | sheet           | content |
      | metadata        | opponent, date, home/away |
      | events          | all event rows (goals, against, substitutions) with minute and half columns |
      | player genders  | the gender for each involved player |

  Scenario: Export all games to one big Excel file
    When I export all games to Excel
    Then the exported workbook should contain one sheet per game and an overall sheet with aggregate statistics

  Scenario: Calculate overall statistics
    Given the following event data across games:
      | game | scorer | type        | against | time  |
      | 1    | Jonas  | schot       |         | minute:12 half:first |
      | 1    | Esmee  | vrije worp  | Kian    | minute:15 half:first |
      | 2    | Jonas  | doorloopbal |         | minute:5 half:first |
    When I view overall statistics
    Then I should see:
      | metric                                    | value |
      | type of goals scored the most              | schot |
      | type of goals scored against the most      | vrije worp |
      | most goals against males or female players | male |
      | home/away advantage vs same team           | home advantage: true/false |

  Scenario: Include statistics in Excel export
    When I export all games to Excel
    Then the overall statistics should be present in the exported file

  Scenario: Removing players from a team
    Given a team exists with players
    When I remove a player from the team
    Then the player should no longer be in the team list

  Scenario: Prevent adding duplicate players to a team
    Given a player is already in a team
    When I try to add the same player again
    Then I should see an error message

  Scenario: Adding players to a team updates the members list
    Given a team exists
    When I add a player to the team
    Then the player should appear in the members list

  Scenario: Editing game details
    Given a game exists
    When I edit the game to set it as a home game
    Then the game should be marked as a home game
    When I edit the date of the game
    Then the game should reflect the new date

  Scenario: Logging goals and substitutes
    Given a game exists
    When I log a goal without minute and half information
    Then the goal should appear in the events list
    When I log a substitute event
    Then the substitute should appear chronologically in the events list

  Scenario: Editing events
    Given a game exists with events
    When I edit a goal event to change the type of goal and the player
    Then the event should reflect the updated information

  Scenario: Deleting players from the players list
    Given a list of players exists
    When I delete a player from the list
    Then the player should no longer appear in the list

  Scenario: Exporting game data to Excel
    Given a game exists
    When I select the game and export it to Excel
    Then the game data should be available in an Excel file

  Scenario: Creating a new game
    Given I want to create a new game
    When I choose to copy an existing game
    Then the new game should have the same details as the copied game
    When I choose to create a new game
    Then I should be able to enter the name of the new game

  Scenario: Game date management
    Given a game exists
    When I create the game
    Then it should have the current date
    When I edit the game date
    Then it should reflect the updated date

  Scenario: Displaying events in the game
    Given a game exists with events
    When I view the events list
    Then I should see goals with player names and how they were scored
    And I should see goals against players

  Scenario: Updating game score
    Given a game starts
    Then the score should be 0 - 0
    When I log a goal event
    Then the score should update accordingly
    When I log a goal against event
    Then the score should update accordingly
    When I view the game details
    Then the score should reflect the goals made and goals against us
    When I save the game
    Then the final score should be saved
