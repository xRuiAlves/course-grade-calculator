const displayError = (message) => {
    document.querySelector("#error").textContent = message;
}

const validateParams = (freq_grade, exam_percentage) => {
    if (isNaN(freq_grade) || isNaN(exam_percentage)) {
        displayError("Both frequency grade and exam percentage");
        return false;
    }
    
    if (!validGrade(freq_grade)) {
        displayError("Frequency grade should be in the range [0, 20]");
        return false;
    }
    
    if (!validPercentage(exam_percentage)) {
        displayError("Exam percentage should be in the range [1, 100]");
        return false;
    }
    
    return true;
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

const clearErrors = () => document.querySelector("#error").innerHTML = "";

const clearResults = () => document.querySelector("#results").innerHTML = "";

const computeGrade = (e) => {
    e.preventDefault();
    
    const freq_grade = parseFloat(document.querySelector("#form input[name=\"freq_grade\"]").value, 10);
    const exam_percentage = parseFloat(document.querySelector("#form input[name=\"exam_percentage\"]").value, 10);
    
    if(!validateParams(freq_grade, exam_percentage)) {
        return;
    }

    const results = document.querySelector("#results");
    
    clearResults();
    clearErrors();

    const { exam_to_final_grades, final_grades } = computeFinalGrades(freq_grade, exam_percentage);
    
    const min_grade = exam_to_final_grades[0];
    const max_grade = exam_to_final_grades[20];
    
    const p = document.createElement("p");

    p.innerHTML = `<strong>Minimum final grade:</strong> ${min_grade} (rounded: ${Math.round(min_grade)})`;
    results.appendChild(p.cloneNode(true));

    p.innerHTML = `<strong>Maximum final grade:</strong> ${max_grade} (rounded: ${Math.round(max_grade)})`;
    results.appendChild(p.cloneNode(true));
    
    p.innerHTML = "<strong>Final grade will be:</strong>";
    p.style.marginTop = "2em";
    results.appendChild(p.cloneNode(true));
    
    const ul = document.createElement("ul");
    for (const final_grade in final_grades) {
        const li = document.createElement("li");
        li.style.marginBottom = "0.5em";
        if (final_grades[final_grade].min !== final_grades[final_grade].max) {
            li.innerHTML = `<strong style="margin-right: 0.75em">${final_grade}</strong> from <strong>${final_grades[final_grade].min}</strong> to <strong>${final_grades[final_grade].max}</strong>`;
        } else {
            li.innerHTML = `<strong style="margin-right: 0.75em">${final_grade}</strong> if <strong>${final_grades[final_grade].min}</strong>`;
        }
        ul.appendChild(li);
    }

    results.appendChild(ul);
}

document.querySelector("#form").addEventListener("submit", computeGrade);