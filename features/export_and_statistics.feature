Feature: Exporting and statistics

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
