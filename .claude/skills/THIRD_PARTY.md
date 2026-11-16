# Skillovi trećih strana

Ovi skillovi su kopirani u projekt da bi se automatski učitali u svakoj Claude Code sesiji otvorenoj u ovom repozitoriju.

| Skill | Izvor | Verzija | Licenca |
|---|---|---|---|
| `impeccable` | [pbakaus/impeccable](https://github.com/pbakaus/impeccable), mapa `.claude/skills/impeccable` | commit `d41d986` (16. 11. 2026.), skill 4.9.2 | Apache 2.0 (`impeccable/LICENSE`, `impeccable/NOTICE.md`) |
| `emil-design-eng`, `animate`, `review-animations`, `improve-animations`, `find-animation-opportunities`, `choreograph`, `animation-vocabulary`, `animation-performance`, `remove-animations`, `gestures`, `break-ui`, `prototype`, `apple-design`, `learn-taste`, `pick-ui-library`, `ask-emil`, `ask-sonner`, `animate-expo`, `mobile-native`, `write-swift` | [emilkowalski/skill](https://github.com/emilkowalski/skill), mapa `skills/` | commit `64eb3de` (15. 11. 2026.) | MIT (`LICENSE` u svakoj mapi) |

## Napomene

- **Impeccable hookovi nisu instalirani.** Upstream nudi hookove (`SessionStart`, `PostToolUse`, `Stop`) koji pokreću detektor nakon svake izmjene. Oni se izvršavaju automatski, izvan odobravanja naredbi, pa nisu dodani. Skill radi i bez njih.
- **Impeccable pokreće vlastiti program.** Skripta `impeccable/scripts/impeccable` pri prvom korištenju preuzima binarni program i provjerava ga prema `engine-checksums.txt`. Preuzeta datoteka i lokalne predmemorije su u `.gitignore`.
- **Ažuriranje:** ponovno kopirati iste mape iz najnovijih verzija izvornih repozitorija i ažurirati commitove u ovoj tablici.
