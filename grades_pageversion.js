const displayError = (message) => {
    clearResults();
    document.querySelector("#error").textContent = message;
}

const validateParams = (freq_grade, exam_percentage, min_grade) => {
    if (isNaN(freq_grade) || isNaN(exam_percentage) || isNaN(min_grade)) {
        displayError("All input parameters must be numbers");
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
    
    if (!validGrade(min_grade)) {
        displayError("Exam minimum grade should be in the range [0, 20]");
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

const calculateGrade = (freq_grade, freq_percentage, exam_grade, exam_percentage) => (
    parseFloat(((freq_grade*freq_percentage/100) + (exam_grade*exam_percentage/100)).toFixed(3), 10)
)

const computeFinalGrades = (freq_grade, exam_percentage) => {
    const freq_percentage = 100 - exam_percentage;
    const possible_exam_grades = buildExamPossibleGrades();

    const exam_to_final_grades = {};
    const final_grades = {};
    possible_exam_grades.forEach((possible_exam_grade) => {
        const final_grade = calculateGrade(freq_grade, freq_percentage, possible_exam_grade, exam_percentage);
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

cropBellowMinGrade = (final_grades, min_grade) => {
    if (min_grade === 0) {
        return final_grades;
    }

    const parsed_final_grades = {};
    parsed_final_grades[0] = {
        min: 0,
        max: min_grade - 0.1
    }

    for (const final_grade in final_grades) {
        if (final_grades[final_grade].min < min_grade && final_grades[final_grade].max < min_grade) {
            continue;
        } else if (final_grades[final_grade].min < min_grade) {
            parsed_final_grades[final_grade] = {
                min: min_grade,
                max: final_grades[final_grade].max
            }
        } else {
            parsed_final_grades[final_grade] = final_grades[final_grade];
        }
    }

    return parsed_final_grades;
}

const clearErrors = () => document.querySelector("#error").innerHTML = "";

const clearResults = () => document.querySelector("#results").innerHTML = "";

const computeGrade = (e) => {
    e.preventDefault();
    
    const freq_grade = parseFloat(document.querySelector("#form input[name=\"freq_grade\"]").value.replace(",","."), 10);
    const exam_percentage = parseFloat(document.querySelector("#form input[name=\"exam_percentage\"]").value.replace(",","."), 10);
    const min_grade = parseFloat(document.querySelector("#form input[name=\"min_grade\"]").value.replace(",","."), 10);
    
    if(!validateParams(freq_grade, exam_percentage, min_grade)) {
        return;
    }

    const results = document.querySelector("#results");
    
    clearResults();
    clearErrors();

    const { exam_to_final_grades, final_grades } = computeFinalGrades(freq_grade, exam_percentage);

    const parsed_final_grades = cropBellowMinGrade(final_grades, min_grade);
    
    const display_min_grade = calculateGrade(freq_grade, (100-exam_percentage), min_grade, exam_percentage);
    const display_max_grade = exam_to_final_grades[20];
    
    const p = document.createElement("p");

    p.innerHTML = `<strong>Minimum final grade:</strong> ${display_min_grade} (rounded: ${Math.round(display_min_grade)})`;
    results.appendChild(p.cloneNode(true));

    p.innerHTML = `<strong>Maximum final grade:</strong> ${display_max_grade} (rounded: ${Math.round(display_max_grade)})`;
    p.classList.add("final-grade-max-min")
    results.appendChild(p.cloneNode(true));
    
    p.innerHTML = "<strong>Final grade will be:</strong>";
    p.classList.remove("final-grade-max-min");
    results.appendChild(p.cloneNode(true));
    
    const table = document.createElement("table");

    const tr_header = document.createElement("tr");
    const th = document.createElement("th");
    const td = document.createElement("td");

    th.textContent = "Final Grade";
    tr_header.appendChild(th.cloneNode(true));
    th.textContent = "from";
    tr_header.appendChild(th.cloneNode(true));
    th.textContent = "to";
    tr_header.appendChild(th.cloneNode(true));

    table.appendChild(tr_header);

    for (const final_grade in parsed_final_grades) {
        const tr = document.createElement("tr");

        td.textContent = final_grade;
        tr.appendChild(td.cloneNode(true));
        td.textContent = parsed_final_grades[final_grade].min;
        tr.appendChild(td.cloneNode(true));
        td.textContent = parsed_final_grades[final_grade].max;
        tr.appendChild(td.cloneNode(true));
        
        table.appendChild(tr);
    }

    results.appendChild(table);
}

document.querySelector("#form").addEventListener("submit", computeGrade);