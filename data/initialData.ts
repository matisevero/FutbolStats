import type { Match, Goal, CustomAchievement, AIInteraction, PlayerProfileData } from '../types';

interface InitialData {
    matches: Omit<Match, 'summary' | 'isGeneratingSummary'>[];
    goals: Goal[];
    customAchievements: CustomAchievement[];
    aiInteractions: AIInteraction[];
    playerProfile: PlayerProfileData;
}

export const initialData: InitialData = {
  "matches": [
    {
      "id": "1761087983468",
      "result": "DERROTA",
      "myGoals": 2,
      "myAssists": 2,
      "date": "2025-10-21",
      "goalDifference": -3,
      "notes": "",
      "myTeamPlayers": [
        {
          "name": "Tebi",
          "goals": 0,
          "assists": 0
        },
        {
          "name": "David",
          "goals": 0,
          "assists": 0
        },
        {
          "name": "Elvis",
          "goals": 0,
          "assists": 0
        },
        {
          "name": "Todi",
          "goals": 0,
          "assists": 0
        }
      ],
      "opponentPlayers": [
        {
          "name": "Colo",
          "goals": 0,
          "assists": 0
        },
        {
          "name": "Fer",
          "goals": 0,
          "assists": 0
        },
        {
          "name": "Bruno",
          "goals": 0,
          "assists": 0
        },
        {
          "name": "Martín",
          "goals": 0,
          "assists": 0
        },
        {
          "name": "Mato",
          "goals": 0,
          "assists": 0
        }
      ]
    },
    {
      "id": "1759878368027",
      "result": "VICTORIA",
      "myGoals": 0,
      "myAssists": 1,
      "date": "2025-10-07",
      "goalDifference": 2,
      "notes": "",
      "myTeamPlayers": [
        {
          "name": "Tebi",
          "goals": 0,
          "assists": 0
        },
        {
          "name": "Victor",
          "goals": 0,
          "assists": 0
        },
        {
          "name": "Elvis",
          "goals": 0,
          "assists": 0
        },
        {
          "name": "Apu",
          "goals": 0,
          "assists": 0
        }
      ],
      "opponentPlayers": [
        {
          "name": "Martín",
          "goals": 0,
          "assists": 0
        },
        {
          "name": "Bruno",
          "goals": 0,
          "assists": 0
        },
        {
          "name": "Fer",
          "goals": 0,
          "assists": 0
        },
        {
          "name": "Colo",
          "goals": 0,
          "assists": 0
        },
        {
          "name": "Fede",
          "goals": 0,
          "assists": 0
        }
      ]
    },
    {
      "id": "1759142400000",
      "result": "DERROTA",
      "myGoals": 0,
      "myAssists": 0,
      "date": "2025-09-30",
      "notes": "diferencia de - 12 goles",
      "goalDifference": -12,
      "myTeamPlayers": [
        {
          "name": "Tebi",
          "goals": 0,
          "assists": 0
        },
        {
          "name": "Toby",
          "goals": 0,
          "assists": 0
        },
        {
          "name": "Elvis",
          "goals": 0,
          "assists": 0
        },
        {
          "name": "Primo",
          "goals": 0,
          "assists": 0
        }
      ],
      "opponentPlayers": [
        {
          "name": "Fer",
          "goals": 0,
          "assists": 0
        },
        {
          "name": "Martín",
          "goals": 0,
          "assists": 0
        },
        {
          "name": "Bruno",
          "goals": 0,
          "assists": 0
        },
        {
          "name": "Colo",
          "goals": 0,
          "assists": 0
        },
        {
          "name": "Victor",
          "goals": 0,
          "assists": 0
        }
      ]
    },
    {
      "id": "1758920811637",
      "result": "EMPATE",
      "myGoals": 0,
      "myAssists": 3,
      "date": "2025-09-23",
      "notes": "",
      "myTeamPlayers": [
        {
          "name": "Tebi",
          "goals": 0,
          "assists": 0
        },
        {
          "name": "David",
          "goals": 0,
          "assists": 0
        },
        {
          "name": "Elvis",
          "goals": 0,
          "assists": 0
        },
        {
          "name": "Primo",
          "goals": 0,
          "assists": 0
        }
      ],
      "opponentPlayers": [
        {
          "name": "Fer",
          "goals": 0,
          "assists": 0
        },
        {
          "name": "Bruno",
          "goals": 0,
          "assists": 0
        },
        {
          "name": "Martín",
          "goals": 0,
          "assists": 0
        },
        {
          "name": "José",
          "goals": 0,
          "assists": 0
        },
        {
          "name": "Mato",
          "goals": 0,
          "assists": 0
        }
      ]
    },
    {
      "id": "1758920802915",
      "result": "VICTORIA",
      "myGoals": 0,
      "myAssists": 0,
      "date": "2025-09-15",
      "myTeamPlayers": [
        {
          "name": "Tebi",
          "goals": 0,
          "assists": 0
        },
        {
          "name": "David",
          "goals": 0,
          "assists": 0
        },
        {
          "name": "Elvis",
          "goals": 0,
          "assists": 0
        },
        {
          "name": "José",
          "goals": 0,
          "assists": 0
        }
      ],
      "opponentPlayers": [
        {
          "name": "Fer",
          "goals": 0,
          "assists": 0
        },
        {
          "name": "Colo",
          "goals": 0,
          "assists": 0
        },
        {
          "name": "Bruno",
          "goals": 0,
          "assists": 0
        },
        {
          "name": "Martín",
          "goals": 0,
          "assists": 0
        },
        {
          "name": "Mato",
          "goals": 0,
          "assists": 0
        }
      ],
      "notes": "",
      "goalDifference": 1
    },
    {
      "id": "1758920790101",
      "result": "VICTORIA",
      "myGoals": 0,
      "myAssists": 3,
      "date": "2025-09-09",
      "myTeamPlayers": [],
      "notes": ""
    },
    {
      "id": "1758920777583",
      "result": "VICTORIA",
      "myGoals": 1,
      "myAssists": 0,
      "date": "2025-09-02",
      "myTeamPlayers": [],
      "notes": ""
    },
    {
      "id": "1758920767690",
      "result": "DERROTA",
      "myGoals": 1,
      "myAssists": 3,
      "date": "2025-08-05",
      "myTeamPlayers": [],
      "notes": ""
    },
    {
      "id": "1758920754618",
      "result": "VICTORIA",
      "myGoals": 2,
      "myAssists": 1,
      "date": "2025-07-31",
      "myTeamPlayers": [],
      "notes": ""
    },
    {
      "id": "1758920737663",
      "result": "DERROTA",
      "myGoals": 1,
      "myAssists": 0,
      "date": "2025-07-31",
      "myTeamPlayers": [],
      "notes": ""
    },
    {
      "id": "1758920723202",
      "result": "DERROTA",
      "myGoals": 0,
      "myAssists": 2,
      "date": "2025-07-22",
      "myTeamPlayers": [],
      "notes": ""
    },
    {
      "id": "1758920709179",
      "result": "VICTORIA",
      "myGoals": 1,
      "myAssists": 4,
      "date": "2025-07-16",
      "myTeamPlayers": [],
      "notes": ""
    },
    {
      "id": "1758920697358",
      "result": "DERROTA",
      "myGoals": 0,
      "myAssists": 3,
      "date": "2025-07-08",
      "myTeamPlayers": [],
      "notes": ""
    },
    {
      "id": "1758920684833",
      "result": "VICTORIA",
      "myGoals": 1,
      "myAssists": 2,
      "date": "2025-06-17",
      "myTeamPlayers": [],
      "notes": ""
    },
    {
      "id": "1758920670347",
      "result": "DERROTA",
      "myGoals": 2,
      "myAssists": 0,
      "date": "2025-06-03",
      "myTeamPlayers": [],
      "notes": ""
    },
    {
      "id": "1758920657708",
      "result": "DERROTA",
      "myGoals": 1,
      "myAssists": 0,
      "date": "2025-05-13",
      "myTeamPlayers": [],
      "notes": ""
    },
    {
      "id": "1758920639493",
      "result": "DERROTA",
      "myGoals": 0,
      "myAssists": 3,
      "date": "2025-04-30",
      "myTeamPlayers": [],
      "notes": ""
    },
    {
      "id": "1758920618234",
      "result": "DERROTA",
      "myGoals": 2,
      "myAssists": 0,
      "date": "2025-04-22",
      "myTeamPlayers": [],
      "notes": ""
    },
    {
      "id": "1758920590381",
      "result": "DERROTA",
      "myGoals": 1,
      "myAssists": 0,
      "date": "2025-04-08",
      "myTeamPlayers": [],
      "notes": ""
    },
    {
      "id": "1758920574966",
      "result": "DERROTA",
      "myGoals": 2,
      "myAssists": 3,
      "date": "2025-04-01",
      "myTeamPlayers": [],
      "notes": ""
    },
    {
      "id": "1758920557724",
      "result": "DERROTA",
      "myGoals": 2,
      "myAssists": 4,
      "date": "2025-02-25",
      "myTeamPlayers": [],
      "notes": ""
    },
    {
      "id": "1758920540792",
      "result": "VICTORIA",
      "myGoals": 2,
      "myAssists": 2,
      "date": "2025-02-20",
      "myTeamPlayers": [],
      "notes": ""
    },
    {
      "id": "1758920525534",
      "result": "VICTORIA",
      "myGoals": 2,
      "myAssists": 3,
      "date": "2025-02-18",
      "myTeamPlayers": [],
      "notes": ""
    },
    {
      "id": "1758920504951",
      "result": "DERROTA",
      "myGoals": 2,
      "myAssists": 1,
      "date": "2025-02-11",
      "myTeamPlayers": [],
      "notes": ""
    },
    {
      "id": "1758920477637",
      "result": "DERROTA",
      "myGoals": 3,
      "myAssists": 1,
      "date": "2025-02-04",
      "myTeamPlayers": [],
      "notes": ""
    },
    {
      "id": "1758920399887",
      "result": "DERROTA",
      "myGoals": 1,
      "myAssists": 1,
      "date": "2025-01-28",
      "myTeamPlayers": [],
      "notes": ""
    },
    {
      "id": "1758920378985",
      "result": "VICTORIA",
      "myGoals": 1,
      "myAssists": 0,
      "date": "2025-01-21",
      "myTeamPlayers": [],
      "notes": ""
    },
    {
      "id": "1758920363599",
      "result": "VICTORIA",
      "myGoals": 2,
      "myAssists": 1,
      "date": "2025-01-07",
      "myTeamPlayers": [],
      "notes": ""
    },
    {
      "id": "1733857200000",
      "result": "DERROTA",
      "myGoals": 1,
      "myAssists": 2,
      "date": "2024-12-10",
      "myTeamPlayers": []
    },
    {
      "id": "1733425200000",
      "result": "DERROTA",
      "myGoals": 0,
      "myAssists": 0,
      "date": "2024-12-05",
      "myTeamPlayers": []
    },
    {
      "id": "1732734000000",
      "result": "DERROTA",
      "myGoals": 0,
      "myAssists": 0,
      "date": "2024-11-28",
      "myTeamPlayers": []
    },
    {
      "id": "1730958000001",
      "result": "DERROTA",
      "myGoals": 1,
      "myAssists": 1,
      "date": "2024-11-07",
      "myTeamPlayers": []
    },
    {
      "id": "1730958000000",
      "result": "DERROTA",
      "myGoals": 0,
      "myAssists": 1,
      "date": "2024-11-07",
      "myTeamPlayers": []
    },
    {
      "id": "1729882800000",
      "result": "DERROTA",
      "myGoals": 1,
      "myAssists": 5,
      "date": "2024-10-30",
      "myTeamPlayers": []
    },
    {
      "id": "1728942000000",
      "result": "EMPATE",
      "myGoals": 0,
      "myAssists": 0,
      "date": "2024-10-15",
      "myTeamPlayers": []
    },
    {
      "id": "1728769200000",
      "result": "VICTORIA",
      "myGoals": 0,
      "myAssists": 1,
      "date": "2024-10-13",
      "myTeamPlayers": []
    },
    {
      "id": "1728337200000",
      "result": "DERROTA",
      "myGoals": 0,
      "myAssists": 1,
      "date": "2024-10-08",
      "myTeamPlayers": []
    },
    {
      "id": "1727732400000",
      "result": "VICTORIA",
      "myGoals": 1,
      "myAssists": 1,
      "date": "2024-10-01",
      "myTeamPlayers": []
    },
    {
      "id": "1727214000000",
      "result": "DERROTA",
      "myGoals": 2,
      "myAssists": 0,
      "date": "2024-09-25",
      "myTeamPlayers": []
    },
    {
      "id": "1726954800000",
      "result": "DERROTA",
      "myGoals": 0,
      "myAssists": 0,
      "date": "2024-09-22",
      "myTeamPlayers": []
    },
    {
      "id": "1725927600000",
      "result": "DERROTA",
      "myGoals": 0,
      "myAssists": 2,
      "date": "2024-09-10",
      "myTeamPlayers": []
    },
    {
      "id": "1725322800000",
      "result": "DERROTA",
      "myGoals": 0,
      "myAssists": 3,
      "date": "2024-09-03",
      "myTeamPlayers": []
    },
    {
      "id": "1723508400000",
      "result": "VICTORIA",
      "myGoals": 1,
      "myAssists": 2,
      "date": "2024-08-13",
      "myTeamPlayers": []
    },
    {
      "id": "1722298800000",
      "result": "VICTORIA",
      "myGoals": 4,
      "myAssists": 1,
      "date": "2024-07-30",
      "myTeamPlayers": []
    },
    {
      "id": "1721953200000",
      "result": "VICTORIA",
      "myGoals": 0,
      "myAssists": 1,
      "date": "2024-07-26",
      "myTeamPlayers": []
    },
    {
      "id": "1721694000000",
      "result": "DERROTA",
      "myGoals": 0,
      "myAssists": 0,
      "date": "2024-07-23",
      "myTeamPlayers": []
    },
    {
      "id": "1721262000000",
      "result": "DERROTA",
      "myGoals": 0,
      "myAssists": 0,
      "date": "2024-07-18",
      "myTeamPlayers": []
    },
    {
      "id": "1721089200000",
      "result": "DERROTA",
      "myGoals": 3,
      "myAssists": 1,
      "date": "2024-07-16",
      "myTeamPlayers": []
    },
    {
      "id": "1720042800000",
      "result": "DERROTA",
      "myGoals": 0,
      "myAssists": 2,
      "date": "2024-07-02",
      "myTeamPlayers": []
    },
    {
      "id": "1716855600000",
      "result": "DERROTA",
      "myGoals": 2,
      "myAssists": 0,
      "date": "2024-05-28",
      "myTeamPlayers": []
    },
    {
      "id": "1716337200000",
      "result": "DERROTA",
      "myGoals": 1,
      "myAssists": 1,
      "date": "2024-05-22",
      "myTeamPlayers": []
    },
    {
      "id": "1715646000000",
      "result": "VICTORIA",
      "myGoals": 4,
      "myAssists": 2,
      "date": "2024-05-14",
      "myTeamPlayers": []
    },
    {
      "id": "1715041200000",
      "result": "DERROTA",
      "myGoals": 1,
      "myAssists": 1,
      "date": "2024-05-07",
      "myTeamPlayers": []
    },
    {
      "id": "1714695600000",
      "result": "DERROTA",
      "myGoals": 0,
      "myAssists": 4,
      "date": "2024-05-03",
      "myTeamPlayers": []
    },
    {
      "id": "1714090800000",
      "result": "DERROTA",
      "myGoals": 0,
      "myAssists": 0,
      "date": "2024-04-26",
      "myTeamPlayers": []
    },
    {
      "id": "1713831600000",
      "result": "DERROTA",
      "myGoals": 6,
      "myAssists": 1,
      "date": "2024-04-23",
      "myTeamPlayers": []
    },
    {
      "id": "1713226800000",
      "result": "DERROTA",
      "myGoals": 0,
      "myAssists": 2,
      "date": "2024-04-16",
      "myTeamPlayers": []
    },
    {
      "id": "1712708400000",
      "result": "DERROTA",
      "myGoals": 1,
      "myAssists": 0,
      "date": "2024-04-10",
      "myTeamPlayers": []
    },
    {
      "id": "1712276400000",
      "result": "EMPATE",
      "myGoals": 2,
      "myAssists": 1,
      "date": "2024-04-05",
      "myTeamPlayers": []
    },
    {
      "id": "1711412400000",
      "result": "DERROTA",
      "myGoals": 2,
      "myAssists": 1,
      "date": "2024-03-26",
      "myTeamPlayers": []
    },
    {
      "id": "1710807600000",
      "result": "DERROTA",
      "myGoals": 1,
      "myAssists": 0,
      "date": "2024-03-19",
      "myTeamPlayers": []
    },
    {
      "id": "1710203200000",
      "result": "DERROTA",
      "myGoals": 2,
      "myAssists": 2,
      "date": "2024-03-12",
      "myTeamPlayers": []
    },
    {
      "id": "1709598000000",
      "result": "VICTORIA",
      "myGoals": 1,
      "myAssists": 3,
      "date": "2024-03-05",
      "myTeamPlayers": []
    },
    {
      "id": "1709083200000",
      "result": "DERROTA",
      "myGoals": 2,
      "myAssists": 1,
      "date": "2024-02-28",
      "myTeamPlayers": []
    },
    {
      "id": "1708561200000",
      "result": "VICTORIA",
      "myGoals": 1,
      "myAssists": 1,
      "date": "2024-02-22",
      "myTeamPlayers": []
    },
    {
      "id": "1708474800000",
      "result": "DERROTA",
      "myGoals": 2,
      "myAssists": 1,
      "date": "2024-02-21",
      "myTeamPlayers": []
    },
    {
      "id": "1705364400000",
      "result": "DERROTA",
      "myGoals": 1,
      "myAssists": 1,
      "date": "2024-01-16",
      "myTeamPlayers": []
    },
    {
      "id": "1704759600000",
      "result": "DERROTA",
      "myGoals": 0,
      "myAssists": 0,
      "date": "2024-01-09",
      "myTeamPlayers": []
    },
    {
      "id": "1704154800000",
      "result": "DERROTA",
      "myGoals": 1,
      "myAssists": 2,
      "date": "2024-01-02",
      "myTeamPlayers": []
    },
    {
      "id": "1703549999999",
      "result": "VICTORIA",
      "myGoals": 2,
      "myAssists": 2,
      "date": "2023-12-26",
      "myTeamPlayers": []
    },
    {
      "id": "1703118000000",
      "result": "VICTORIA",
      "myGoals": 2,
      "myAssists": 0,
      "date": "2023-12-21",
      "myTeamPlayers": []
    },
    {
      "id": "1702945200000",
      "result": "DERROTA",
      "myGoals": 0,
      "myAssists": 1,
      "date": "2023-12-19",
      "myTeamPlayers": []
    },
    {
      "id": "1702603200000",
      "result": "DERROTA",
      "myGoals": 2,
      "myAssists": 1,
      "date": "2023-12-15",
      "myTeamPlayers": []
    },
    {
      "id": "1702340400000",
      "result": "VICTORIA",
      "myGoals": 2,
      "myAssists": 3,
      "date": "2023-12-12",
      "myTeamPlayers": []
    },
    {
      "id": "1701735600000",
      "result": "DERROTA",
      "myGoals": 4,
      "myAssists": 3,
      "date": "2023-12-05",
      "myTeamPlayers": []
    },
    {
      "id": "1701130800000",
      "result": "VICTORIA",
      "myGoals": 3,
      "myAssists": 1,
      "date": "2023-11-28",
      "myTeamPlayers": []
    },
    {
      "id": "1700612400000",
      "result": "VICTORIA",
      "myGoals": 3,
      "myAssists": 2,
      "date": "2023-11-22",
      "myTeamPlayers": []
    },
    {
      "id": "1700007600000",
      "result": "VICTORIA",
      "myGoals": 1,
      "myAssists": 1,
      "date": "2023-11-14",
      "myTeamPlayers": []
    },
    {
      "id": "1699316400000",
      "result": "DERROTA",
      "myGoals": 3,
      "myAssists": 2,
      "date": "2023-11-07",
      "myTeamPlayers": []
    },
    {
      "id": "1698970800000",
      "result": "EMPATE",
      "myGoals": 3,
      "myAssists": 0,
      "date": "2023-11-02",
      "myTeamPlayers": []
    },
    {
      "id": "1698798000000",
      "result": "DERROTA",
      "myGoals": 3,
      "myAssists": 0,
      "date": "2023-11-01",
      "myTeamPlayers": []
    },
    {
      "id": "1698279600000",
      "result": "DERROTA",
      "myGoals": 2,
      "myAssists": 2,
      "date": "2023-10-26",
      "myTeamPlayers": []
    },
    {
      "id": "1698106800000",
      "result": "VICTORIA",
      "myGoals": 1,
      "myAssists": 2,
      "date": "2023-10-24",
      "myTeamPlayers": []
    },
    {
      "id": "1697502000000",
      "result": "VICTORIA",
      "myGoals": 4,
      "myAssists": 0,
      "date": "2023-10-17",
      "myTeamPlayers": []
    },
    {
      "id": "1696897200000",
      "result": "EMPATE",
      "myGoals": 2,
      "myAssists": 2,
      "date": "2023-10-10",
      "myTeamPlayers": []
    },
    {
      "id": "1696292400000",
      "result": "DERROTA",
      "myGoals": 0,
      "myAssists": 4,
      "date": "2023-10-03",
      "myTeamPlayers": []
    },
    {
      "id": "1695687600000",
      "result": "EMPATE",
      "myGoals": 2,
      "myAssists": 1,
      "date": "2023-09-26",
      "myTeamPlayers": []
    },
    {
      "id": "1695082800000",
      "result": "VICTORIA",
      "myGoals": 1,
      "myAssists": 3,
      "date": "2023-09-19",
      "myTeamPlayers": []
    },
    {
      "id": "1694650800000",
      "result": "DERROTA",
      "myGoals": 2,
      "myAssists": 3,
      "date": "2023-09-14",
      "myTeamPlayers": []
    },
    {
      "id": "1694478000000",
      "result": "VICTORIA",
      "myGoals": 1,
      "myAssists": 2,
      "date": "2023-09-12",
      "myTeamPlayers": []
    },
    {
      "id": "1693873200000",
      "result": "DERROTA",
      "myGoals": 0,
      "myAssists": 0,
      "date": "2023-09-05",
      "myTeamPlayers": []
    },
    {
      "id": "1693268400000",
      "result": "DERROTA",
      "myGoals": 1,
      "myAssists": 1,
      "date": "2023-08-29",
      "myTeamPlayers": []
    },
    {
      "id": "1692663600000",
      "result": "DERROTA",
      "myGoals": 1,
      "myAssists": 1,
      "date": "2023-08-22",
      "myTeamPlayers": []
    },
    {
      "id": "1690935600000",
      "result": "DERROTA",
      "myGoals": 1,
      "myAssists": 6,
      "date": "2023-08-03",
      "myTeamPlayers": []
    },
    {
      "id": "1690849200000",
      "result": "DERROTA",
      "myGoals": 1,
      "myAssists": 3,
      "date": "2023-08-01",
      "myTeamPlayers": []
    },
    {
      "id": "1689812400000",
      "result": "DERROTA",
      "myGoals": 1,
      "myAssists": 1,
      "date": "2023-07-20",
      "myTeamPlayers": []
    },
    {
      "id": "1689639600000",
      "result": "DERROTA",
      "myGoals": 0,
      "myAssists": 3,
      "date": "2023-07-18",
      "myTeamPlayers": []
    },
    {
      "id": "1689466800000",
      "result": "VICTORIA",
      "myGoals": 0,
      "myAssists": 0,
      "date": "2023-07-16",
      "myTeamPlayers": []
    },
    {
      "id": "1689034800000",
      "result": "DERROTA",
      "myGoals": 3,
      "myAssists": 1,
      "date": "2023-07-11",
      "myTeamPlayers": []
    },
    {
      "id": "1688257200000",
      "result": "VICTORIA",
      "myGoals": 1,
      "myAssists": 0,
      "date": "2023-07-02",
      "myTeamPlayers": []
    },
    {
      "id": "1687825200000",
      "result": "DERROTA",
      "myGoals": 1,
      "myAssists": 2,
      "date": "2023-06-27",
      "myTeamPlayers": []
    },
    {
      "id": "1685924400000",
      "result": "DERROTA",
      "myGoals": 1,
      "myAssists": 2,
      "date": "2023-06-06",
      "myTeamPlayers": []
    },
    {
      "id": "1685838000000",
      "result": "DERROTA",
      "myGoals": 0,
      "myAssists": 0,
      "date": "2023-06-04",
      "myTeamPlayers": []
    },
    {
      "id": "1685578800000",
      "result": "DERROTA",
      "myGoals": 1,
      "myAssists": 0,
      "date": "2023-06-01",
      "myTeamPlayers": []
    },
    {
      "id": "1685319600000",
      "result": "VICTORIA",
      "myGoals": 3,
      "myAssists": 1,
      "date": "2023-05-30",
      "myTeamPlayers": []
    },
    {
      "id": "1685233200000",
      "result": "VICTORIA",
      "myGoals": 0,
      "myAssists": 0,
      "date": "2023-05-28",
      "myTeamPlayers": []
    },
    {
      "id": "1684795200000",
      "result": "DERROTA",
      "myGoals": 2,
      "myAssists": 2,
      "date": "2023-05-23",
      "myTeamPlayers": []
    },
    {
      "id": "1684363200000",
      "result": "VICTORIA",
      "myGoals": 0,
      "myAssists": 1,
      "date": "2023-05-18",
      "myTeamPlayers": []
    },
    {
      "id": "1684190400000",
      "result": "DERROTA",
      "myGoals": 0,
      "myAssists": 1,
      "date": "2023-05-16",
      "myTeamPlayers": []
    },
    {
      "id": "1683758400000",
      "result": "VICTORIA",
      "myGoals": 1,
      "myAssists": 5,
      "date": "2023-05-11",
      "myTeamPlayers": []
    },
    {
      "id": "1683585600000",
      "result": "VICTORIA",
      "myGoals": 0,
      "myAssists": 2,
      "date": "2023-05-09",
      "myTeamPlayers": []
    },
    {
      "id": "1682980800000",
      "result": "DERROTA",
      "myGoals": 2,
      "myAssists": 2,
      "date": "2023-05-02",
      "myTeamPlayers": []
    },
    {
      "id": "1682462400000",
      "result": "VICTORIA",
      "myGoals": 1,
      "myAssists": 1,
      "date": "2023-04-26",
      "myTeamPlayers": []
    },
    {
      "id": "1681172400000",
      "result": "EMPATE",
      "myGoals": 0,
      "myAssists": 0,
      "date": "2023-04-11",
      "myTeamPlayers": []
    },
    {
      "id": "1680044400000",
      "result": "EMPATE",
      "myGoals": 1,
      "myAssists": 1,
      "date": "2023-03-28",
      "myTeamPlayers": []
    },
    {
      "id": "1679358000000",
      "result": "VICTORIA",
      "myGoals": 1,
      "myAssists": 1,
      "date": "2023-03-21",
      "myTeamPlayers": []
    },
    {
      "id": "1678753200000",
      "result": "DERROTA",
      "myGoals": 5,
      "myAssists": 2,
      "date": "2023-03-14",
      "myTeamPlayers": []
    },
    {
      "id": "1678234800000",
      "result": "VICTORIA",
      "myGoals": 5,
      "myAssists": 2,
      "date": "2023-03-08",
      "myTeamPlayers": []
    },
    {
      "id": "1677543600000",
      "result": "DERROTA",
      "myGoals": 1,
      "myAssists": 0,
      "date": "2023-02-28",
      "myTeamPlayers": []
    },
    {
      "id": "1676420400000",
      "result": "DERROTA",
      "myGoals": 0,
      "myAssists": 0,
      "date": "2023-02-15",
      "myTeamPlayers": []
    },
    {
      "id": "1676161200000",
      "result": "VICTORIA",
      "myGoals": 2,
      "myAssists": 2,
      "date": "2023-02-12",
      "myTeamPlayers": []
    },
    {
      "id": "1675210800000",
      "result": "VICTORIA",
      "myGoals": 2,
      "myAssists": 1,
      "date": "2023-02-01",
      "myTeamPlayers": []
    },
    {
      "id": "1673914800000",
      "result": "DERROTA",
      "myGoals": 3,
      "myAssists": 1,
      "date": "2023-01-17",
      "myTeamPlayers": []
    },
    {
      "id": "1673569200000",
      "result": "VICTORIA",
      "myGoals": 0,
      "myAssists": 0,
      "date": "2023-01-13",
      "myTeamPlayers": []
    },
    {
      "id": "1673306400000",
      "result": "DERROTA",
      "myGoals": 0,
      "myAssists": 2,
      "date": "2023-01-10",
      "myTeamPlayers": []
    },
    {
      "id": "1672705200000",
      "result": "VICTORIA",
      "myGoals": 0,
      "myAssists": 0,
      "date": "2023-01-03",
      "myTeamPlayers": []
    }
  ],
  "goals": [],
  "customAchievements": [],
  "aiInteractions": [],
  "playerProfile": {
      "name": "Mati",
      "photo": "",
      "dob": "",
      "weight": 0,
      "height": 0,
      "favoriteTeam": ""
  }
}
}