import { NextResponse } from 'next/server';

export async function GET(request) {
  // Get the selected language from the URL (defaults to English if not provided)
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get('lang') || 'en';

  const questionsEN = [
    {
      id: 1,
      question: "What is the traditional Rwandan greeting meaning 'Peace be with you'?",
      options: ["Muraho", "Amakuru", "Bite", "Mwaramutse"],
      correctAnswer: "Muraho"
    },
    {
      id: 2,
      question: "Which ceremony is traditionally performed to name a newborn child?",
      options: ["Gusaba", "Kwita Izina", "Gutwikurura", "Kunywana"],
      correctAnswer: "Kwita Izina"
    },
    {
      id: 3,
      question: "What does the proverb 'Agahuru k'imbwa gahye' generally signify?",
      options: ["The dog is hungry", "Things have become very serious/irreversible", "A small fire burns brightly", "Hunting is forbidden"],
      correctAnswer: "Things have become very serious/irreversible"
    },
    {
      id: 4,
      question: "In traditional Rwandan society, what is 'Umuganda'?",
      options: ["A wedding dance", "Community work", "A type of drum", "A harvest festival"],
      correctAnswer: "Community work"
    },
    {
      id: 5,
      question: "Which of these is NOT a traditional Rwandan value?",
      options: ["Kwihesha Agaciro (Dignity)", "Ubumwe (Unity)", "Kwigira (Self-reliance)", "Ubwibone (Arrogance)"],
      correctAnswer: "Ubwibone (Arrogance)"
    },
    {
      id: 6,
      question: "What is the traditional Rwandan dance performed during celebrations?",
      options: ["Intore", "Umushagiriro", "Umudiho", "Ikinyabupfura"],
      correctAnswer: "Intore"
    },
    {
      id: 7,
      question: "In Rwandan culture, what does 'Ubuntu' represent?",
      options: ["Individual success", "Humanity and interconnectedness", "Material wealth", "Personal achievement"],
      correctAnswer: "Humanity and interconnectedness"
    }
  ];

  const questionsRW = [
    {
      id: 1,
      question: "Ni ubuhe buryo bwa gakondo bwo gusuhuzanya busobanura 'Amahoro abe muri mwe'?",
      options: ["Muraho", "Amakuru", "Bite", "Mwaramutse"],
      correctAnswer: "Muraho"
    },
    {
      id: 2,
      question: "Ni uwuhe muhango wa gakondo ukorwa mu kwita umwana wavutse izina?",
      options: ["Gusaba", "Kwita Izina", "Gutwikurura", "Kunywana"],
      correctAnswer: "Kwita Izina"
    },
    {
      id: 3,
      question: "Umugani 'Agahuru k'imbwa gahye' usobanura iki muri rusange?",
      options: ["Imbwa irashonje", "Ibintu byakomeye cyangwa ntibigishoboye gusubirwaho", "Agamuriro gato kaka cyane", "Guhiga birabujijwe"],
      correctAnswer: "Ibintu byakomeye cyangwa ntibigishoboye gusubirwaho"
    },
    {
      id: 4,
      question: "Mu muco nyarwanda, 'Umuganda' ni iki?",
      options: ["Imbyino y'ubukwe", "Igikorwa cy'umuganda rusange n'iterambere", "Ubwoko bw'ingoma", "Ibirori by'umusaruro"],
      correctAnswer: "Igikorwa cy'umuganda rusange n'iterambere"
    },
    {
      id: 5,
      question: "Ni iyihe muri izi ATARI indangagaciro y'umuco nyarwanda?",
      options: ["Kwihesha Agaciro", "Ubumwe", "Kwigira", "Ubwibone"],
      correctAnswer: "Ubwibone"
    },
    {
      id: 6,
      question: "Ni iyihe mbyino ya gakondo nyarwanda ibyinwa mu birori?",
      options: ["Intore", "Umushagiriro", "Umudiho", "Ikinyabupfura"],
      correctAnswer: "Intore"
    },
    {
      id: 7,
      question: "Mu muco nyarwanda, 'Ubuntu' busobanura iki?",
      options: ["Intsinzi y'umuntu ku giti cye", "Ubumuntu no kubana neza n'abandi", "Ubukire n'imitungo", "Kugera ku ntego zawe bwite"],
      correctAnswer: "Ubumuntu no kubana neza n'abandi"
    }
  ];

  return NextResponse.json({ questions: lang === 'rw' ? questionsRW : questionsEN }, { status: 200 });
}