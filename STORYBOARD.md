# Approved BCD decoder storyboard

Approved in chat; revised opening included. Narration timings measured from edge-tts.

## Frame 1

status: animated
src: compositions/01-introduction.html
start: 0
duration: 23
rules: dynamic-content-sequencing; stat-bars-and-fills; deterministic signal and group highlighting

From four bits to one digit

In this video, we'll design a digital circuit that converts a four-bit BCD input into the seven signals needed to display a decimal digit. We'll start with simple logic gates, simplify one output with a Karnaugh map, and then watch the complete decoder operate.

On screen: Design the logic that turns a BCD input into a decimal digit.

## Frame 2

status: animated
src: compositions/02-and.html
start: 23
duration: 24
rules: dynamic-content-sequencing; stat-bars-and-fills; deterministic signal and group highlighting

AND: both inputs must be 1

A logic signal has two states: zero and one. An AND gate produces one only when both inputs are one. If either input is zero, the output is zero. We write this as X AND Y, or X dot Y. Later, AND gates will recognize particular combinations of our input bits.

On screen: AND recognizes a combination: every required condition must be true.

## Frame 3

status: animated
src: compositions/03-or.html
start: 47
duration: 24
rules: dynamic-content-sequencing; stat-bars-and-fills; deterministic signal and group highlighting

OR: at least one input is 1

An OR gate produces one when either input is one, including when both are one. Only two zero inputs produce a zero output. We write OR using a plus sign. This is Boolean logic, so one OR one is still one. OR gates will combine the different conditions that light a segment.

On screen: OR combines alternatives. Both inputs may be 1.

## Frame 4

status: animated
src: compositions/04-not.html
start: 71
duration: 18
rules: dynamic-content-sequencing; stat-bars-and-fills; deterministic signal and group highlighting

NOT: reverse the signal

A NOT gate reverses its input: zero becomes one, and one becomes zero. A bar over a variable means NOT. Having both a signal and its inverse lets us recognize either value of an input bit.

On screen: A bar means NOT: 0 becomes 1, and 1 becomes 0.

## Frame 5

status: animated
src: compositions/05-interface.html
start: 89
duration: 27
rules: dynamic-content-sequencing; stat-bars-and-fills; deterministic signal and group highlighting

Define the input and the outputs

Binary-coded decimal, or BCD, represents one decimal digit with four bits. Their weights are eight, four, two, and one. Zero-one-zero-one therefore represents five. Our seven outputs control segments a through g, with one meaning illuminated. Each segment has its own Boolean function of the same four inputs.

On screen: BCD is one decimal digit in four bits. Output 1 means segment ON.

## Frame 6

status: animated
src: compositions/06-truth.html
start: 116
duration: 27
rules: dynamic-content-sequencing; stat-bars-and-fills; deterministic signal and group highlighting

Design one output: segment a

Let's design the top segment, a. It lights for zero, two, three, five, six, seven, eight, and nine. It stays off for one and four. These requirements form a truth table. We could build a separate detector for every illuminated case, but a Karnaugh map helps us combine cases and simplify the circuit.

On screen: Top segment a is OFF for 1 and 4, and ON for every other BCD digit.

## Frame 7

status: animated
src: compositions/07-map.html
start: 143
duration: 29
rules: dynamic-content-sequencing; stat-bars-and-fills; deterministic signal and group highlighting

Rearrange the truth table

A Karnaugh map rearranges the truth table so neighboring cells differ in just one bit. Notice the order: zero-zero, zero-one, one-one, one-zero. The rows describe the upper two input bits; the columns describe the lower two. Every cell still represents exactly one input combination.

On screen: Gray-code order makes neighboring cells differ in exactly one bit.

## Frame 8

status: animated
src: compositions/08-grouping.html
start: 172
duration: 34
rules: dynamic-content-sequencing; stat-bars-and-fills; deterministic signal and group highlighting

Group neighbors to simplify

We group ones into rectangles containing a power-of-two number of cells. Groups may overlap, and opposite edges of the map are neighbors. The X cells represent inputs ten through fifteen, which are not decimal BCD digits. We may include these don't-care cells when they help simplify the logic. Later, a separate validity signal will blank those inputs.

On screen: Use rectangular groups of 1, 2, 4, 8… cells. Never include a 0.

## Frame 9

status: animated
src: compositions/09-derive.html
start: 206
duration: 42.03333333333333
rules: dynamic-content-sequencing; stat-bars-and-fills; deterministic signal and group highlighting

Keep only the bits that stay constant

Within each group, keep only the bits that remain constant. First, these eight cells all have I one equal to one, so their term is simply I one. Another group has I three equal to one. This four-cell group keeps I two and I zero both equal to one. Finally, the four corners wrap around the map and keep both of those bits at zero. OR these four terms together to obtain our simplified expression.

On screen: A changing input disappears from that group’s product term.

## Frame 10

status: animated
src: compositions/10-gates.html
start: 248.03333333333333
duration: 28
rules: dynamic-content-sequencing; stat-bars-and-fills; deterministic signal and group highlighting

Turn the expression into a circuit

Now translate the equation into hardware. The two single-variable terms are direct signals. The other two terms use AND gates, with inverted inputs where needed. An OR gate combines all four terms. This structure is called a sum of products: AND operations form the products, and OR combines them.

On screen: Sum of products: AND builds each condition; OR combines the conditions.

## Frame 11

status: animated
src: compositions/11-pla.html
start: 276.0333333333333
duration: 32
rules: dynamic-content-sequencing; stat-bars-and-fills; deterministic signal and group highlighting

Share the logic in a regular array

We repeat the same design process for the other six segments. To keep the circuit organized, we arrange it as a programmable logic array, or PLA. The AND plane generates product terms from shared input rails. The OR plane selects which terms contribute to each segment. A term needed by several segments is generated once and shared.

On screen: 15 shared product terms → 7 segment functions. A dot means connected.

## Frame 12

status: animated
src: compositions/12-validity.html
start: 308.0333333333333
duration: 28.033333333333335
rules: dynamic-content-sequencing; stat-bars-and-fills; deterministic signal and group highlighting

Blank every invalid BCD input

Don’t-care cells simplified the internal logic, but they do not guarantee a blank display for invalid inputs. We add a validity signal. A code is valid when the eight’s bit is zero, or when both the four’s and two’s bits are zero. Every segment output is ANDed with this signal. Inputs ten through fifteen therefore turn every segment off.

On screen: Don’t-care simplification + explicit blanking = defined behavior for all 16 inputs.

## Frame 13

status: animated
src: compositions/13-trace.html
start: 336.06666666666666
duration: 30
rules: dynamic-content-sequencing; stat-bars-and-fills; deterministic signal and group highlighting

Trace one input: 0101 → 5

Let’s follow the input zero-one-zero-one: decimal five. The input rails provide each bit and its inverse. The AND plane evaluates every product term, and the OR plane combines the selected results. Outputs a, c, d, f, and g become one. The input is valid, so these five segments illuminate and form the digit five.

On screen: 0101 enables a, c, d, f and g. The display shows 5.

## Frame 14

status: animated
src: compositions/14-simulation.html
start: 366.06666666666666
duration: 40
rules: dynamic-content-sequencing; stat-bars-and-fills; deterministic signal and group highlighting

Exercise the complete decoder

Now we can exercise the complete decoder. As the input counts from zero to nine, the same fixed logic produces each digit’s segment pattern. No circuit changes are needed. When the input reaches ten, VALID becomes zero and the display goes blank. The remaining invalid codes are blanked in the same way.

On screen: The same fixed circuit handles every input: 0–9 display; 10–15 blank.

## Frame 15

status: animated
src: compositions/15-recap.html
start: 406.06666666666666
duration: 22
rules: dynamic-content-sequencing; stat-bars-and-fills; deterministic signal and group highlighting

From a requirement to working logic

Start by deciding when each segment must light. Write its truth table, simplify it with a Karnaugh map, and implement the result with AND, OR, and NOT. Organize shared terms into a PLA, validate every input, and the complete seven-segment decoder follows.

On screen: One repeatable method. Seven outputs. A complete decoder.