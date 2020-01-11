const displayError = (message, code) => {
    console.error(message);
    process.exit(code);
}

const validateParams = (freq_grade, exam_percentage) => {
    if (isNaN(freq_grade) || isNaN(exam_percentage)) {
        displayError("Both frequency grade and exam percentage", 2);
    }
    
    if (!validGrade(freq_grade)) {
        displayError("Frequency grade should be in the range [0, 20]", 3);
    }
    
    if (!validPercentage(exam_percentage)) {
        displayError("Exam percentage should be in the range [1, 100]", 4);
    }
}

const validGrade = (grade) => grade >= 0 && grade <= 20;

const validPercentage = (percentage) => percentage >= 1 && percentage <= 100;

const buildExamPossibleGrades = () => {
    const possible_grades = [];
    for (let possible_grade = 0; possible_grade <= 200; possible_grade++) {
        possible_grades.push(possible_grade/10);
    }
    return possible_grades;
}

const computeFinalGrades = (freq_grade, exam_percentage) => {
    const freq_percentage = 100 - exam_percentage;
    const possible_exam_grades = buildExamPossibleGrades();

    const exam_to_final_grades = {};
    const final_grades = {};
    possible_exam_grades.forEach((possible_exam_grade) => {
        const final_grade = parseFloat(((freq_grade*freq_percentage/100) + (possible_exam_grade*exam_percentage/100)).toFixed(3), 10);
        const rounded_final_grade = Math.round(final_grade);
        if (!final_grades[rounded_final_grade]) {
            final_grades[rounded_final_grade] = {
                min: possible_exam_grade,
                max: possible_exam_grade
            }
        }

        final_grades[rounded_final_grade].min = Math.min(final_grades[rounded_final_grade].min, possible_exam_grade);
        final_grades[rounded_final_grade].max = Math.max(final_grades[rounded_final_grade].max, possible_exam_grade);
        exam_to_final_grades[possible_exam_grade] = final_grade;
    });

    return {
        exam_to_final_grades,
        final_grades
    };
}

if (process.argv.length < 4) {
    displayError(`usage: node grades.js <freq_grade> <exam_percentage>
\tfreq_grade\tfrequency grade
\texam_percentage\thow much the exam is worth in the final grade
    `, 1);
}

const freq_grade = parseFloat(process.argv[2], 10);
const exam_percentage = parseFloat(process.argv[3], 10);

validateParams(freq_grade, exam_percentage);

const { exam_to_final_grades, final_grades } = computeFinalGrades(freq_grade, exam_percentage);


const min_grade = exam_to_final_grades[0];
const max_grade = exam_to_final_grades[20];

console.log(`Minimum final grade: ${min_grade} (rounded: ${Math.round(min_grade)})`);
console.log(`Maximum final grade: ${max_grade} (rounded: ${Math.round(max_grade)})\n`);

console.log("Final grade will be")
for (const final_grade in final_grades) {
    if (final_grades[final_grade].min !== final_grades[final_grade].max) {
        console.log(`${final_grade}\tfrom ${final_grades[final_grade].min} to ${final_grades[final_grade].max}`);
    } else {
        console.log(`${final_grade}\tif ${final_grades[final_grade].min}`);
    }
}