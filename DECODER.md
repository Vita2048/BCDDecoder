# Boolean design reference

Inputs I3 I2 I1 I0 have weights 8, 4, 2, 1. Outputs a–g are active high. NOT is written ¬ (equivalent to an overbar); multiplication is AND and addition is OR.

The raw segment equations are valid for decimal BCD inputs 0–9:

```text
a_raw = I1 + I3 + I0·I2 + ¬I0·¬I2
b_raw = ¬I2 + I0·I1 + ¬I0·¬I1
c_raw = I0 + I2 + ¬I1
d_raw = I3 + I1·¬I0 + I1·¬I2 + ¬I0·¬I2 + I0·I2·¬I1
e_raw = I1·¬I0 + ¬I0·¬I2
f_raw = I3 + I2·¬I0 + I2·¬I1 + ¬I0·¬I1
g_raw = I3 + I1·¬I2 + I2·¬I0 + I2·¬I1

VALID = ¬I3 + ¬I2·¬I1
segment = segment_raw · VALID
```

There are fifteen unique product terms across the seven raw equations. The diagram shows one row per term, a shared literal-selection AND plane, and a seven-column OR plane. The dots are PLA selections; this is a logical array representation.

## Worked map for segment a

| I3 I2 / I1 I0 | 00 | 01 | 11 | 10 |
|---|---|---|---|---|
| 00 | 1 | 0 | 1 | 1 |
| 01 | 0 | 1 | 1 | 1 |
| 11 | X | X | X | X |
| 10 | 1 | 1 | X | X |

- I1 group: cells 2, 3, 6, 7, 10, 11, 14, 15.
- I3 group: cells 8–15.
- I2·I0 group: cells 5, 7, 13, 15.
- ¬I2·¬I0 group: cells 0, 2, 8, 10 (the four corners).

The X cells are don't-cares only for the raw logic. The separate VALID gate guarantees that every final segment output is zero for inputs 10–15.
