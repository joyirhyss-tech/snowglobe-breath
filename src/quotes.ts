// Closing quotes shown after the final exhale of each session.
//
// Curated 2026-04-26 from QUOTES_RESEARCH.md (a 1,400-line research pass
// through ~70 authors with citations to primary sources). The research
// pass deliberately excluded several famous misattributions:
//   - "People will forget what you said…" — NOT Maya Angelou (Carl Buehner, 1971)
//   - "Easier to build strong children than repair broken men" — NOT Frederick Douglass
//   - "At the center of your being…" — NOT Lao Tzu (Deepak Chopra, 1995)
//   - "Sitting quietly, doing nothing, spring comes…" — NOT Bashō (Zenrin)
//   - "Out of suffering have emerged the strongest souls…" — NOT Kahlil Gibran
//   - Most "Hafiz" online — Daniel Ladinsky originals, not Hafiz
//   - Most short "Rumi" — Coleman Barks paraphrases, not Rumi's Persian
//
// Voices centered: Black women, Black men, Indigenous (incl. Native
// Hawaiian), Latine, Asian (incl. Korean monks and modern Korean poets),
// SWANA/Arab, disabled writers, LGBTQ+, somatic teachers, Chicago and
// Netherlands ties (per the founder's own roots), and ancient/spiritual
// wisdom traditions (Tao, Rumi via Barks, Bhagavad Gita, Dhammapada,
// Japanese haiku masters, Dōgen).
//
// Each quote was matched to a primary-source citation in the research
// file. A human cultural-fluency reviewer pass is still recommended for
// Korean Buddhist monks, Hawaiian sources, and Dutch poets before the
// next major release.

export type Quote = {
  text: string;
  author: string;
};

export const QUOTES: Quote[] = [
  // ── Black Women & Femmes ──────────────────────────────────────────
  { text: 'Caring for myself is not self-indulgence, it is self-preservation, and that is an act of political warfare.', author: 'Audre Lorde' },
  { text: 'When I dare to be powerful, to use my strength in the service of my vision, then it becomes less and less important whether I am afraid.', author: 'Audre Lorde' },
  { text: 'Poetry is not a luxury. It is a vital necessity of our existence.', author: 'Audre Lorde' },
  { text: 'There are so many silences to be broken.', author: 'Audre Lorde' },
  { text: 'The quality of light by which we scrutinize our lives has direct bearing upon the product which we live.', author: 'Audre Lorde' },

  { text: 'You are your best thing.', author: 'Toni Morrison' },
  { text: 'If you surrendered to the air, you could ride it.', author: 'Toni Morrison' },
  { text: 'Love is or it ain’t. Thin love ain’t love at all.', author: 'Toni Morrison' },
  { text: 'Anything dead coming back to life hurts.', author: 'Toni Morrison' },

  { text: 'Still I rise.', author: 'Maya Angelou' },
  { text: 'Good done anywhere is good done everywhere.', author: 'Maya Angelou' },
  { text: 'There is no greater agony than bearing an untold story inside you.', author: 'Maya Angelou' },

  { text: 'All that you touch you change. All that you change changes you.', author: 'Octavia E. Butler' },
  { text: 'The only lasting truth is Change.', author: 'Octavia E. Butler' },
  { text: 'Kindness eases change.', author: 'Octavia E. Butler' },

  { text: 'The moment we choose to love we begin to move against domination, against oppression.', author: 'bell hooks' },
  { text: 'Rarely, if ever, are any of us healed in isolation. Healing is an act of communion.', author: 'bell hooks' },
  { text: 'When we are loving we openly and honestly express care, affection, responsibility, respect, commitment, and trust.', author: 'bell hooks' },
  { text: 'Knowing how to be solitary is central to the art of loving.', author: 'bell hooks' },

  { text: 'Won’t you celebrate with me what I have shaped into a kind of life?', author: 'Lucille Clifton' },
  { text: 'Come celebrate with me that everyday something has tried to kill me, and has failed.', author: 'Lucille Clifton' },
  { text: 'I am running into a new year and the old years blow back like a wind that I catch in my hair.', author: 'Lucille Clifton' },

  { text: 'We are sudden stars, you and I, exploding in our blue black skins.', author: 'Sonia Sanchez' },
  { text: 'Peace is a full time job.', author: 'Sonia Sanchez' },

  { text: 'Wonder is a force of liberation. It makes sense of what our souls inherently know we were meant for.', author: 'Cole Arthur Riley' },
  { text: 'If you cannot find God in the mundane, you will not find God at all.', author: 'Cole Arthur Riley' },
  { text: 'To be known is to be loved, and to be loved is to be known.', author: 'Cole Arthur Riley' },

  { text: 'Rest is a form of resistance because it disrupts and pushes back against capitalism and white supremacy.', author: 'Tricia Hersey' },
  { text: 'Our deepest truths arrive in moments of rest.', author: 'Tricia Hersey' },

  { text: 'Trust the people. If you trust the people, they become trustworthy.', author: 'adrienne maree brown' },
  { text: 'Pleasure is a measure of freedom.', author: 'adrienne maree brown' },
  { text: 'Things are not getting worse, they are getting uncovered.', author: 'adrienne maree brown' },

  { text: 'We are the ones we have been waiting for.', author: 'June Jordan' },
  { text: 'I am not wrong: Wrong is not my name.', author: 'June Jordan' },
  { text: 'I lift my voice to take an inventory of all that survives.', author: 'June Jordan' },

  { text: 'We like to think of it as parallel to what we know, only bigger.', author: 'Tracy K. Smith' },
  { text: 'We saw what we wanted to see. The earth was ours, then.', author: 'Tracy K. Smith' },

  { text: 'I think it pisses God off if you walk by the color purple in a field somewhere and don’t notice it.', author: 'Alice Walker' },
  { text: 'Hard times require furious dancing.', author: 'Alice Walker' },
  { text: 'In search of my mother’s garden, I found my own.', author: 'Alice Walker' },

  { text: 'Our liberation is bound up with our softness.', author: 'Junauda Petrus-Nasah' },

  // ── Black Men ──────────────────────────────────────────────────────
  { text: 'There is in every person an inward sea, and in that sea there is an island.', author: 'Howard Thurman' },
  { text: 'There is something in every one of you that waits and listens for the sound of the genuine in yourself.', author: 'Howard Thurman' },

  { text: 'Love takes off masks that we fear we cannot live without and know we cannot live within.', author: 'James Baldwin' },
  { text: 'Not everything that is faced can be changed; but nothing can be changed until it is faced.', author: 'James Baldwin' },
  { text: 'The place in which I’ll fit will not exist until I make it.', author: 'James Baldwin' },
  { text: 'We are part of each other.', author: 'James Baldwin' },

  { text: 'I would unite with anybody to do right and with nobody to do wrong.', author: 'Frederick Douglass' },
  { text: 'I prayed for freedom for twenty years, but received no answer until I prayed with my legs.', author: 'Frederick Douglass' },

  { text: 'My delight grows, as does my mindfulness, my attention, my will to wonder.', author: 'Ross Gay' },
  { text: 'What if we joined our sorrows. What if that is joy?', author: 'Ross Gay' },
  { text: 'Among the things I’ve been thinking about is how I might pay better attention.', author: 'Ross Gay' },

  { text: 'Care is the antidote to violence.', author: 'Saidiya Hartman' },

  { text: 'Hold fast to dreams, for if dreams die, life is a broken-winged bird that cannot fly.', author: 'Langston Hughes' },
  { text: 'I, too, sing America.', author: 'Langston Hughes' },
  { text: 'Bring me all of your dreams, you dreamer, bring me all of your heart melodies.', author: 'Langston Hughes' },

  { text: 'The truth changes shape just as much as a lie.', author: 'Marlon James' },

  // ── Indigenous (incl. Native Hawaiian) ────────────────────────────
  { text: 'Remember the sky that you were born under.', author: 'Joy Harjo' },
  { text: 'Remember you are this universe and this universe is you.', author: 'Joy Harjo' },
  { text: 'To pray you open your whole self to sky, to earth, to sun, to moon, to one whole voice that is you.', author: 'Joy Harjo' },
  { text: 'There is no world like the one surfacing.', author: 'Joy Harjo' },
  { text: 'I release you, my beautiful and terrible fear.', author: 'Joy Harjo' },

  { text: 'All flourishing is mutual.', author: 'Robin Wall Kimmerer' },
  { text: 'In some Native languages the term for plants translates to those who take care of us.', author: 'Robin Wall Kimmerer' },

  { text: 'Some people see scars, and it is wounding they remember. To me they are proof of the fact that there is healing.', author: 'Linda Hogan' },
  { text: 'There is a way that nature speaks, that land speaks. Most of the time we are simply not patient enough, quiet enough, to pay attention to the story.', author: 'Linda Hogan' },
  { text: 'Be still, they say. Watch and listen. You are the result of the love of thousands.', author: 'Linda Hogan' },

  { text: 'Once in his life a man ought to concentrate his mind upon the remembered earth.', author: 'N. Scott Momaday' },
  { text: 'We are what we imagine. Our very existence consists in our imagination of ourselves.', author: 'N. Scott Momaday' },
  { text: 'The events of one’s life take place, take place.', author: 'N. Scott Momaday' },

  { text: 'Love is a practice, not a feeling.', author: 'Leanne Betasamosake Simpson' },

  { text: 'Aloha is the unconditional desire to promote the true good of other people in a friendly spirit, out of a sense of kinship.', author: 'Aunty Pilahi Paki' },
  { text: 'Akahai — kindness, expressed with tenderness.', author: 'Aunty Pilahi Paki' },
  { text: 'Aloha — the breath of life shared.', author: 'Aunty Pilahi Paki' },

  { text: 'All knowledge is not taught in the same school.', author: 'ʻŌlelo Noʻeau' },
  { text: 'The rain follows after the forest.', author: 'ʻŌlelo Noʻeau' },
  { text: 'In the word is life, in the word is death.', author: 'ʻŌlelo Noʻeau' },
  { text: 'The land is chief; man is its servant.', author: 'ʻŌlelo Noʻeau' },
  { text: 'Aloha kekahi i kekahi. Love one another.', author: 'ʻŌlelo Noʻeau' },
  { text: 'Pūpūkahi i holomua. Unite to move forward.', author: 'ʻŌlelo Noʻeau' },
  { text: 'No task is too big when done together.', author: 'ʻŌlelo Noʻeau' },

  { text: 'Mine is the sound of the surge of the sea and the long, slow weeping of women.', author: 'Haunani-Kay Trask' },
  { text: 'From a Native daughter, a chant for the land.', author: 'Haunani-Kay Trask' },

  { text: 'Every word is a seed.', author: 'Brandy Nālani McDougall' },

  { text: 'ʻĀina is that which feeds.', author: 'Aunty Edith Kanakaʻole' },

  // ── Latine ────────────────────────────────────────────────────────
  { text: 'I change myself, I change the world.', author: 'Gloria Anzaldúa' },
  { text: 'Voyager, there are no bridges, one builds them as one walks.', author: 'Gloria Anzaldúa' },
  { text: 'I am a turtle, wherever I go I carry home on my back.', author: 'Gloria Anzaldúa' },

  { text: 'You must remember to come back for the ones who cannot leave as easily as you.', author: 'Sandra Cisneros' },
  { text: 'Each time it’s the same and not the same.', author: 'Sandra Cisneros' },

  { text: 'I am a child of the Americas, a light-skinned mestiza of the Caribbean.', author: 'Aurora Levins Morales' },
  { text: 'History is the story we tell to remember ourselves.', author: 'Aurora Levins Morales' },

  { text: 'If nothing saves us from death, at least love should save us from life.', author: 'Pablo Neruda' },
  { text: 'I love you as certain dark things are to be loved, in secret, between the shadow and the soul.', author: 'Pablo Neruda' },
  { text: 'And now you are mine. Rest with your dream in my dream.', author: 'Pablo Neruda' },

  { text: 'The danger lies in ranking the oppressions.', author: 'Cherríe Moraga' },

  // ── Asian (East / SE / S) ─────────────────────────────────────────
  { text: 'Breathing in, I calm my body. Breathing out, I smile.', author: 'Thich Nhat Hanh' },
  { text: 'The present moment is filled with joy and happiness. If you are attentive, you will see it.', author: 'Thich Nhat Hanh' },
  { text: 'Walk as if you are kissing the Earth with your feet.', author: 'Thich Nhat Hanh' },
  { text: 'Smile, breathe, and go slowly.', author: 'Thich Nhat Hanh' },
  { text: 'Because you are alive, everything is possible.', author: 'Thich Nhat Hanh' },

  { text: 'Sometimes being offered tenderness feels like the very proof that you’ve been ruined.', author: 'Ocean Vuong' },
  { text: 'Too much joy, I swear, is lost in our desperation to keep it.', author: 'Ocean Vuong' },
  { text: 'They say nothing lasts forever, but they’re just scared it will last longer than they can love it.', author: 'Ocean Vuong' },

  { text: 'There are days we live as if death were nowhere in the background.', author: 'Li-Young Lee' },
  { text: 'What is it in me would not let the world be?', author: 'Li-Young Lee' },

  { text: 'Another world is not only possible, she is on her way. On a quiet day, I can hear her breathing.', author: 'Arundhati Roy' },
  { text: 'To love. To be loved. To never forget your own insignificance.', author: 'Arundhati Roy' },

  { text: 'Let my love, like sunlight, surround you and yet give you illumined freedom.', author: 'Rabindranath Tagore' },
  { text: 'The butterfly counts not months but moments, and has time enough.', author: 'Rabindranath Tagore' },
  { text: 'Clouds come floating into my life, no longer to carry rain or usher storm, but to add color to my sunset sky.', author: 'Rabindranath Tagore' },

  { text: 'You are the sky. Everything else, it’s just the weather.', author: 'Pema Chödrön' },
  { text: 'Nothing ever goes away until it has taught us what we need to know.', author: 'Pema Chödrön' },
  { text: 'Compassion is not a relationship between the healer and the wounded. It’s a relationship between equals.', author: 'Pema Chödrön' },

  { text: 'My beloved is gone. Ah, my beloved is gone.', author: 'Han Yongun' },
  { text: 'Because I love, I leave you.', author: 'Han Yongun' },

  { text: 'Non-possession does not mean having nothing; it means not having what is unnecessary.', author: 'Beopjeong Sunim' },
  { text: 'Happiness is not found only in the many and the great.', author: 'Beopjeong Sunim' },

  { text: 'When you set down the thought that you are right, the conflict disappears.', author: 'Pomnyun Sunim' },
  { text: 'Suffering arises in the mind.', author: 'Pomnyun Sunim' },

  { text: 'When you go away, weary of seeing me, I will let you go in silence, with care.', author: 'Kim Sowŏl' },
  { text: 'I will gather azaleas from Mount Yaksan and strew them on the path you walk.', author: 'Kim Sowŏl' },

  { text: 'I learned that the world is full of people who love you and have never met you.', author: 'Kao Kalia Yang' },
  { text: 'We were a people in love with each other in a world that did not love us back.', author: 'Kao Kalia Yang' },

  { text: 'No matter what, I want to continue living with the awareness that I will die. Without that, I am not alive.', author: 'Banana Yoshimoto' },
  { text: 'The place I want to call my own. I’ll find it for sure.', author: 'Banana Yoshimoto' },
  { text: 'Truly great people emit a light that warms the hearts of those around them.', author: 'Banana Yoshimoto' },

  { text: 'A dream you dream alone is only a dream. A dream you dream together is reality.', author: 'Yoko Ono' },
  { text: 'Listen to the sound of the earth turning.', author: 'Yoko Ono' },

  // ── SWANA / Arab ──────────────────────────────────────────────────
  { text: 'Your pain is the breaking of the shell that encloses your understanding.', author: 'Kahlil Gibran' },
  { text: 'Work is love made visible.', author: 'Kahlil Gibran' },
  { text: 'Trees are poems that the earth writes upon the sky.', author: 'Kahlil Gibran' },

  { text: 'Before you know what kindness really is, you must lose things.', author: 'Naomi Shihab Nye' },
  { text: 'Then it is only kindness that makes sense anymore.', author: 'Naomi Shihab Nye' },

  { text: 'We have on this earth what makes life worth living.', author: 'Mahmoud Darwish' },
  { text: 'Think of others. Do not forget the people who want peace.', author: 'Mahmoud Darwish' },
  { text: 'I have learned and dismantled all the words in order to draw from them a single one: home.', author: 'Mahmoud Darwish' },

  { text: 'I think that mountains are the gods of the world.', author: 'Etel Adnan' },
  { text: 'To be is also to be in love.', author: 'Etel Adnan' },

  // ── Disabled Writers ──────────────────────────────────────────────
  { text: 'Access intimacy is that elusive, hard to describe feeling when someone else gets your access needs.', author: 'Mia Mingus' },
  { text: 'We will not stop until every disabled person is free.', author: 'Mia Mingus' },

  { text: 'Care webs are the future. They are also the past and the present.', author: 'Leah Lakshmi Piepzna-Samarasinha' },
  { text: 'We are each other’s best chance at survival.', author: 'Leah Lakshmi Piepzna-Samarasinha' },

  { text: 'I want to enter the worlds beyond cure.', author: 'Eli Clare' },

  // ── LGBTQ+ ────────────────────────────────────────────────────────
  { text: 'You never completely have your rights, one person, until you all have your rights.', author: 'Marsha P. Johnson' },
  { text: 'Darling, I want my gay rights now.', author: 'Marsha P. Johnson' },

  { text: 'Sometimes one has to know something many times over.', author: 'Maggie Nelson' },
  { text: 'I have been trying, for some time now, to find dignity in my loneliness.', author: 'Maggie Nelson' },
  { text: 'Words change depending on who speaks them; there is no cure.', author: 'Maggie Nelson' },

  { text: 'I will love you, with no need of an apology.', author: 'Andrea Gibson' },
  { text: 'Honestly, I want every part of you to feel home in the home of your skin.', author: 'Andrea Gibson' },
  { text: 'I’m not the kind of girl who wants the kind of love that wants me to be small.', author: 'Andrea Gibson' },

  { text: 'Living takes practice.', author: 'Saeed Jones' },
  { text: 'I can survive this. I can. I can.', author: 'Saeed Jones' },

  // ── Embodiment / Somatic ──────────────────────────────────────────
  { text: 'The body is where we live. It is where we fear, hope, and react.', author: 'Resmaa Menakem' },
  { text: 'Slow down. Notice. Stay with what is.', author: 'Resmaa Menakem' },

  { text: 'The hardest part of healing is unlearning the patterns that once protected us.', author: 'Yung Pueblo' },
  { text: 'Letting go is not losing, it is making space.', author: 'Yung Pueblo' },
  { text: 'Peace is the most valuable thing I own.', author: 'Yung Pueblo' },

  { text: 'The times are urgent: let us slow down.', author: 'Bayo Akomolafe' },
  { text: 'What if the way we respond to the crisis is part of the crisis?', author: 'Bayo Akomolafe' },
  { text: 'We are made of meeting.', author: 'Bayo Akomolafe' },

  { text: 'I said to my body, softly, I want to be your friend. It took a long breath, and replied, I have been waiting my whole life for this.', author: 'Nayyirah Waheed' },
  { text: 'I am mine before I am ever anyone else’s.', author: 'Nayyirah Waheed' },

  // ── Chicago ───────────────────────────────────────────────────────
  { text: 'Live not for battles won. Live not for the-end-of-the-song. Live in the along.', author: 'Gwendolyn Brooks' },
  { text: 'Exhaust the little moment. Soon it dies.', author: 'Gwendolyn Brooks' },
  { text: 'We are each other’s harvest; we are each other’s business; we are each other’s magnitude and bond.', author: 'Gwendolyn Brooks' },

  { text: 'Hope is a discipline.', author: 'Mariame Kaba' },
  { text: 'Everything worthwhile is done with other people.', author: 'Mariame Kaba' },
  { text: 'Let this radicalize you rather than lead you to despair.', author: 'Mariame Kaba' },

  { text: 'I am not lost. I am right here.', author: 'Jamila Woods' },

  { text: 'The way to right wrongs is to turn the light of truth upon them.', author: 'Ida B. Wells' },

  // ── Netherlands ───────────────────────────────────────────────────
  { text: 'Despite everything, life is full of beauty and meaning.', author: 'Etty Hillesum' },
  { text: 'There is a really deep well inside me. And in it dwells God. Sometimes I am there too.', author: 'Etty Hillesum' },

  { text: 'Peace is not an absence of war, it is a virtue, a state of mind, a disposition for benevolence, confidence, justice.', author: 'Spinoza' },
  { text: 'Blessedness is not the reward of virtue, but virtue itself.', author: 'Spinoza' },
  { text: 'All things excellent are as difficult as they are rare.', author: 'Spinoza' },

  // ── Wisdom Traditions ─────────────────────────────────────────────
  { text: 'The softest things in the world overcome the hardest.', author: 'Lao Tzu' },
  { text: 'Nature does not hurry, yet everything is accomplished.', author: 'Lao Tzu' },
  { text: 'Knowing others is intelligence; knowing yourself is true wisdom.', author: 'Lao Tzu' },
  { text: 'Water is fluid, soft, and yielding. But water will wear away rock, which is rigid and cannot yield.', author: 'Lao Tzu' },
  { text: 'The Master, by residing in the Tao, sets an example for all beings.', author: 'Lao Tzu' },

  { text: 'Out beyond ideas of wrongdoing and rightdoing, there is a field. I’ll meet you there.', author: 'Rumi' },
  { text: 'What you seek is seeking you.', author: 'Rumi' },
  { text: 'Don’t grieve. Anything you lose comes round in another form.', author: 'Rumi' },
  { text: 'Let yourself be silently drawn by the strange pull of what you really love.', author: 'Rumi' },
  { text: 'The breeze at dawn has secrets to tell you. Don’t go back to sleep.', author: 'Rumi' },

  { text: 'Do not go to the garden of flowers. O friend, go not there. In your body is the garden of flowers.', author: 'Kabir' },

  { text: 'You have a right to your actions, but never to your actions’ fruits.', author: 'Bhagavad Gita' },
  { text: 'The mind is restless and difficult to restrain, but it is subdued by practice.', author: 'Bhagavad Gita' },
  { text: 'Set your heart upon your work, but never on its reward.', author: 'Bhagavad Gita' },

  { text: 'The first peace, which is the most important, is that which comes within the souls of people when they realize their oneness with the universe and all its powers.', author: 'Black Elk' },
  { text: 'Everything the Power of the World does is done in a circle.', author: 'Black Elk' },

  { text: 'Hatred does not cease by hatred, but only by love; this is the eternal rule.', author: 'Dhammapada' },
  { text: 'All experience is preceded by mind, led by mind, made by mind.', author: 'Dhammapada' },
  { text: 'Better than a thousand hollow words is one word that brings peace.', author: 'Dhammapada' },

  { text: 'The old pond. A frog jumps in, sound of water.', author: 'Matsuo Bashō' },
  { text: 'Even in Kyoto, hearing the cuckoo’s cry, I long for Kyoto.', author: 'Matsuo Bashō' },
  { text: 'The temple bell stops, but the sound keeps coming out of the flowers.', author: 'Matsuo Bashō' },
  { text: 'Every day is a journey, and the journey itself is home.', author: 'Matsuo Bashō' },
  { text: 'First winter rain, even the monkey seems to want a raincoat.', author: 'Matsuo Bashō' },

  { text: 'The world of dew is the world of dew. And yet, and yet.', author: 'Kobayashi Issa' },
  { text: 'O snail, climb Mount Fuji, but slowly, slowly.', author: 'Kobayashi Issa' },
  { text: 'What a strange thing, to be alive beneath cherry blossoms.', author: 'Kobayashi Issa' },

  { text: 'A flower falls, even though we love it; and a weed grows, even though we do not love it.', author: 'Dōgen' },
  { text: 'Enlightenment is intimacy with all things.', author: 'Dōgen' },

  // ── Founder ───────────────────────────────────────────────────────
  // The writer who built this library. Korean African American adoptee,
  // raised in Hilo, now in Chicago. Author name: Kim Jo Yi (김조이) —
  // her given Korean name. First line from "How My Survival Became My
  // Work" (Substack, Jan 2026); second from "Unrooted" (Medium).
  { text: 'I belong to me now.', author: 'Kim Jo Yi' },
  { text: 'Letting go doesn’t mean falling, it means flying.', author: 'Kim Jo Yi' },
];

// Random pick at session start. Stateless — every session draws fresh from
// the full list. With ~170 quotes, repeats inside a single sitting are
// acceptably rare.
export function pickRandomQuote(): Quote {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
}

// Replace the final space with a non-breaking space (U+00A0) so the last
// two words bind together. Combined with text-wrap: balance this prevents
// any single word from ending up orphaned on its own line.
const NBSP = String.fromCharCode(0x00a0);
export function preventWidow(text: string): string {
  const lastSpace = text.lastIndexOf(' ');
  if (lastSpace === -1) return text;
  return text.slice(0, lastSpace) + NBSP + text.slice(lastSpace + 1);
}
