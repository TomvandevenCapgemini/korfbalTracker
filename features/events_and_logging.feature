Feature: In-game events and live persistence

  Background:
    Given a game exists with id 1 and opponent "Team B" and date "2025-10-01"

  # New requirement: events log minute and whether first or second half
  Scenario: Log a goal (scored by) with minute and half
    When in minute "12" of the "first" half player "Jonas" scores a goal of type "schot" in game id 1
    Then the game id 1 should contain an event: scorer "Jonas", type "schot", minute 12, half "first"

  Scenario: Log a goal against (against who and type) with minute and half
    When in minute "15" of the "first" half player "Esmee" concedes a goal of type "vrije worp" against player "Kian" in game id 1
    Then the game id 1 should contain an event: against "Kian", type "vrije worp", minute 15, half "first"

  Scenario: Log substitutions (must be same gender) with minute and half
    When in minute "20" of the "first" half substitute "Tess" enters replacing "Jonas" in game id 1
    Then game id 1 should contain substitution event: in "Tess", out "Jonas", minute 20, half "first"
    And the substitution should be rejected if substitute and substituted player are of different genders

  Scenario: Events are saved immediately with minute and half
    When I log a goal event in minute "5" of the "second" half in game id 1
    Then querying the database for game id 1 should return that event with minute 5 and half "second"
