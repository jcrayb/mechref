
$(document).ready(function() {

    rkr_fc_c = new PrairieDrawAnim("rkr-fc-c", function(t) {
        this.setUnits(4.5, 3);

        this.addOption("showLabels", true);
        this.addOption("showAngVel", true);
        this.addOption("axis", "k");
        this.addOption("showVectors", false);

        var O = $V([0, 0, 0]);
        var rX = $V([1, 0, 0]);
        var rY = $V([0, 1, 0]);
        var rZ = $V([0, 0, 1]);
        var gS = 2; // ground size

        var theta = t - 0.5 * Math.sin(t);
        var omega = 1 - 0.5 * Math.cos(t);

        var axis;
        if (this.getOption("axis") === "i") {
            axis = Vector.i;
        } else if (this.getOption("axis") === "j") {
            axis = Vector.j;
        } else if (this.getOption("axis") === "k") {
            axis = Vector.k;
        } else if (this.getOption("axis") === "ij") {
            axis = Vector.i.add(Vector.j);
        } else if (this.getOption("axis") === "ijk") {
            axis = Vector.i.add(Vector.j).add(Vector.k);
        }

        var omegaVec = axis.toUnitVector().x(omega);

        var splitLine = function(p1, p2, type, drawAbove) {
            var above = [], below = [];
            if (p1.e(3) >= 0 && p2.e(3) >= 0) {
                above = [p1, p2];
            } else if (p1.e(3) <= 0 && p2.e(3) <= 0) {
                below = [p1, p2];
            } else {
                var alpha = p1.e(3) / (p1.e(3) - p2.e(3));
                var p3 = p1.x(1 - alpha).add(p2.x(alpha));
                if (p1.e(3) >= 0) {
                    above = [p1, p3];
                    below = [p3, p2];
                } else {
                    above = [p3, p2];
                    below = [p1, p3];
                }
            }
            if (drawAbove) {
                if (above.length === 2) {
                    this.line(above[0], above[1], type);
                }
            } else {
                if (below.length === 2) {
                    this.line(below[0], below[1], type);
                }
            }
        }.bind(this);

        var cube = {};
        cube["000"] = $V([-1, -1, -1]).rotate(theta, $L(O, axis));
        cube["001"] = $V([-1, -1,  1]).rotate(theta, $L(O, axis));
        cube["010"] = $V([-1,  1, -1]).rotate(theta, $L(O, axis));
        cube["011"] = $V([-1,  1,  1]).rotate(theta, $L(O, axis));
        cube["100"] = $V([ 1, -1, -1]).rotate(theta, $L(O, axis));
        cube["101"] = $V([ 1, -1,  1]).rotate(theta, $L(O, axis));
        cube["110"] = $V([ 1,  1, -1]).rotate(theta, $L(O, axis));
        cube["111"] = $V([ 1,  1,  1]).rotate(theta, $L(O, axis));

        if (this.getOption("showVectors")) {
            for (var c in cube) {
                if (cube[c].e(3) < 0) {
                    this.arrow(O, cube[c], "position");
                }
            }
        }

        splitLine(cube["000"], cube["001"], undefined, false);
        splitLine(cube["010"], cube["011"], undefined, false);
        splitLine(cube["100"], cube["101"], undefined, false);
        splitLine(cube["110"], cube["111"], undefined, false);
        splitLine(cube["000"], cube["010"], undefined, false);
        splitLine(cube["010"], cube["110"], undefined, false);
        splitLine(cube["110"], cube["100"], undefined, false);
        splitLine(cube["100"], cube["000"], undefined, false);
        splitLine(cube["001"], cube["011"], undefined, false);
        splitLine(cube["011"], cube["111"], undefined, false);
        splitLine(cube["111"], cube["101"], undefined, false);
        splitLine(cube["101"], cube["001"], undefined, false);

        var groundBorder = [$V([-gS, -gS, 0]), $V([-gS, gS, 0]), $V([gS, gS, 0]), $V([gS, -gS, 0])];
        var groundAlpha = 0.8;
        this.save();
        this.setProp("shapeInsideColor", "rgba(255, 255, 255, " + groundAlpha + ")");
        this.polyLine(groundBorder, true, true);
        this.restore();

        var nGrid = 3;
        for (var i = -nGrid; i <= nGrid; i++) {
            this.line($V([i / nGrid * gS, -gS, 0]), $V([i / nGrid * gS, gS, 0]), "grid");
            this.line($V([-gS, i / nGrid * gS, 0]), $V([gS, i / nGrid * gS, 0]), "grid");
        }
        var faceLine = function(points) {
            var line = [];
            var lastPoint = points[3];
            var lastAbove = (lastPoint.e(3) > 0);
            for (var i = 0; i < 4; i++) {
                var above = (points[i].e(3) > 0);
                if (above !== lastAbove) {
                    var alpha = this.linearDeinterp(points[i].e(3), lastPoint.e(3), 0);
                    line.push(this.linearInterpVector(points[i], lastPoint, alpha));
                }
                lastPoint = points[i];
                lastAbove = above;
            }
            if (line.length === 2) {
                this.line(line[0], line[1], "grid");
            }
        }.bind(this);

        faceLine([cube["000"], cube["001"], cube["011"], cube["010"]]);
        faceLine([cube["100"], cube["101"], cube["111"], cube["110"]]);
        faceLine([cube["000"], cube["001"], cube["101"], cube["100"]]);
        faceLine([cube["010"], cube["011"], cube["111"], cube["110"]]);
        faceLine([cube["000"], cube["010"], cube["110"], cube["100"]]);
        faceLine([cube["001"], cube["011"], cube["111"], cube["101"]]);

        this.polyLine(groundBorder, true, false);
        this.arrow(O, rX);
        this.arrow(O, rY);
        this.arrow(O, rZ);
        if (this.getOption("showLabels")) {
            this.labelLine(O, rX, $V([1, -1]), "TEX:$x$");
            this.labelLine(O, rY, $V([1, 1]), "TEX:$y$");
            this.labelLine(O, rZ, $V([1, 1]), "TEX:$z$");
        }

        if (this.getOption("showVectors")) {
            for (var c in cube) {
                if (cube[c].e(3) >= 0) {
                    this.arrow(O, cube[c], "position");
                }
            }
        }

        splitLine(cube["000"], cube["001"], undefined, true);
        splitLine(cube["010"], cube["011"], undefined, true);
        splitLine(cube["100"], cube["101"], undefined, true);
        splitLine(cube["110"], cube["111"], undefined, true);
        splitLine(cube["000"], cube["010"], undefined, true);
        splitLine(cube["010"], cube["110"], undefined, true);
        splitLine(cube["110"], cube["100"], undefined, true);
        splitLine(cube["100"], cube["000"], undefined, true);
        splitLine(cube["001"], cube["011"], undefined, true);
        splitLine(cube["011"], cube["111"], undefined, true);
        splitLine(cube["111"], cube["101"], undefined, true);
        splitLine(cube["101"], cube["001"], undefined, true);

        if (this.getOption("showAngVel")) {
            this.arrow(O, omegaVec, "angVel");
            if (this.getOption("showLabels")) {
                this.labelLine(O, omegaVec, $V([1, 1]), "TEX:$\\vec{\\omega}$");
            }
        }

    });

    rkr_fc_c.activate3DControl();

    rkr_fe_c = new PrairieDrawAnim("rkr-fe-c", function(t) {
        this.setUnits(4.5, 3);

        this.addOption("showLabels", true);
        this.addOption("showVelocity", false);

        var O = $V([0, 0, 0]);
        var rX = $V([1, 0, 0]);
        var rY = $V([0, 1, 0]);
        var rZ = $V([0, 0, 1]);
        var gS = 2; // ground size

        var theta = 1.2 * Math.sin(t);
        var omega = 1.2 * Math.cos(t);
        var omegaVec = $V([0, 0, omega]);

        var p = $V([1.2, 0, 0]).rotate(theta, $L(O, Vector.k));
        var v = omegaVec.cross(p);

        if (omegaVec.e(3) < 0) {
            this.arrow(O, omegaVec, "angVel");
            this.labelLine(O, omegaVec, $V([1, 1]), "TEX:$\\vec{\\omega}$");
        }

        var groundBorder = [$V([-gS, -gS, 0]), $V([-gS, gS, 0]), $V([gS, gS, 0]), $V([gS, -gS, 0])];
        var groundAlpha = 0.8;
        this.save();
        this.setProp("shapeInsideColor", "rgba(255, 255, 255, " + groundAlpha + ")");
        this.polyLine(groundBorder, true, true);
        this.restore();

        var nGrid = 3;
        for (var i = -nGrid; i <= nGrid; i++) {
            this.line($V([i / nGrid * gS, -gS, 0]), $V([i / nGrid * gS, gS, 0]), "grid");
            this.line($V([-gS, i / nGrid * gS, 0]), $V([gS, i / nGrid * gS, 0]), "grid");
        }
        this.polyLine(groundBorder, true, false);
        this.arrow(O, rX);
        this.arrow(O, rY);
        this.arrow(O, rZ);
        if (this.getOption("showLabels")) {
            this.labelLine(O, rX, $V([1, -1]), "TEX:$x$");
            this.labelLine(O, rY, $V([1, 1]), "TEX:$y$");
            this.labelLine(O, rZ, $V([1, 1]), "TEX:$z$");
        }

        if (omegaVec.e(3) >= 0) {
            this.arrow(O, omegaVec, "angVel");
            this.labelLine(O, omegaVec, $V([1, 1]), "TEX:$\\vec{\\omega}$");
        }

        this.arrow(O, p, "position");
        this.labelLine(O, p, $V([1, 0]), "TEX:$\\hat{a}$");

        if (this.getOption("showVelocity")) {
            this.arrow(p, p.add(v), "velocity");
            this.labelLine(p, p.add(v), $V([1, 0]), "TEX:$\\dot{\\hat{a}}$");
        }

        this.circleArrow3D(O, 0.7, Vector.k, Vector.i, -omega / 2, omega / 2, "angVel");
        var omegaText = (omega >= 0) ? "TEX:$\\omega$" : "TEX:$-\\omega$";
        this.labelCircleLine3D(omegaText, $V([1, 1]), O, 0.7, Vector.k, Vector.i, -omega / 2, omega / 2);

        this.circleArrow3D(O, 0.5, Vector.k, Vector.i, 0, theta, "angle");
        var thetaText = (theta >= 0) ? "TEX:$\\theta$" : "TEX:$-\\theta$";
        this.labelCircleLine3D(thetaText, $V([0, -1]), O, 0.5, Vector.k, Vector.i, 0, theta);
    });

    rkr_fe_c.activate3DControl();

    rkr_fg_c = new PrairieDrawAnim("rkr-fg-c", function(t) {
        this.setUnits(9, 6);

        this.addOption("showLabels", true);
        this.addOption("showMoving", true);
        this.addOption("showRigid", false);
        this.addOption("showFixed", false);
        this.addOption("showDerivatives", false);

        var O = $V([0, 0]);
        var theta = t - 1.5 * Math.cos(t) + Math.PI / 2;
        var omega = 1 + 1.5 * Math.sin(t);

        var bases = [
            $V([-0.7, -0.7]).rotate(theta, O),
            $V([0.7, 0.2]).rotate(theta, O),
            $V([-0.3, 0.5]).rotate(theta, O),
            $V([0.4, -0.9]).rotate(theta, O),
        ];

        var moveBases = [
            $V([0.4 * Math.sin(0.4 * t), Math.sin(0.9 * t + 0.5)]),
            $V([0.4 * Math.cos(0.6 * t), Math.sin(1.5 * t)]),
            $V([0.4 * Math.sin(0.7 * t + 3), Math.cos(1.3 * t + 3)]),
            $V([0.4 * Math.sin(1.2 * t + 0.8), Math.cos(0.2 * t + 1.2)]),
        ];

        var vecs = [
            $V([0.7, 0.7]).rotate(theta, O),
            $V([0.2, -0.5]).rotate(theta, O),
            $V([-0.6, 0.8]).rotate(theta, O),
            $V([-0.5, -0.4]).rotate(theta, O),
        ];

        var derivatives = [
            vecs[0].rotate(Math.PI / 2, O).x(omega),
            vecs[1].rotate(Math.PI / 2, O).x(omega),
            vecs[2].rotate(Math.PI / 2, O).x(omega),
            vecs[3].rotate(Math.PI / 2, O).x(omega),
        ];

        var offset = $V([0.3 * Math.sin(0.8 * t), Math.sin(2 * 0.8 * t)]);

        var omegaText = (omega >= 0) ? "TEX:$\\omega$" : "TEX:$-\\omega$";

        if (this.getOption("showMoving")) {
            this.save();
            this.translate($V([-3, 0]));
            this.arrow(moveBases[0], moveBases[0].add(vecs[0]), "position");
            this.arrow(moveBases[1], moveBases[1].add(vecs[1]), "acceleration");
            this.arrow(moveBases[2], moveBases[2].add(vecs[2]), "angMom");
            this.arrow(moveBases[3], moveBases[3].add(vecs[3]));
            /*if (this.getOption("showLabels")) {
                this.labelLine(moveBases[0], moveBases[0].add(vecs[0]), $V([1, 0]), "TEX:$\\vec{a}$");
                this.labelLine(moveBases[1], moveBases[1].add(vecs[1]), $V([1, 0]), "TEX:$\\vec{b}$");
                this.labelLine(moveBases[2], moveBases[2].add(vecs[2]), $V([1, 0]), "TEX:$\\vec{c}$");
                this.labelLine(moveBases[3], moveBases[3].add(vecs[3]), $V([1, 0]), "TEX:$\\vec{d}$");
            }*/
            if (this.getOption("showDerivatives")) {
                this.arrow(moveBases[0].add(vecs[0]), moveBases[0].add(vecs[0]).add(derivatives[0]), "velocity");
                this.arrow(moveBases[1].add(vecs[1]), moveBases[1].add(vecs[1]).add(derivatives[1]), "velocity");
                this.arrow(moveBases[2].add(vecs[2]), moveBases[2].add(vecs[2]).add(derivatives[2]), "velocity");
                this.arrow(moveBases[3].add(vecs[3]), moveBases[3].add(vecs[3]).add(derivatives[3]), "velocity");
            }
            this.circleArrow(O, 1, Math.PI / 2 - omega / 2, Math.PI / 2 + omega / 2, "angVel", true, 0.1);
            this.labelCircleLine(O, 1, Math.PI / 2 - omega / 2, Math.PI / 2 + omega / 2, $V([0, 1]), omegaText, true);
            this.restore();
        }

        if (this.getOption("showRigid")) {
            this.save();
            this.translate($V([0, 0]));
            this.translate(offset);
            this.arrow(bases[0], bases[0].add(vecs[0]), "position");
            this.arrow(bases[1], bases[1].add(vecs[1]), "acceleration");
            this.arrow(bases[2], bases[2].add(vecs[2]), "angMom");
            this.arrow(bases[3], bases[3].add(vecs[3]));
            /*if (this.getOption("showLabels")) {
                this.labelLine(bases[0], bases[0].add(vecs[0]), $V([1, 0]), "TEX:$\\vec{a}$");
                this.labelLine(bases[1], bases[1].add(vecs[1]), $V([1, 0]), "TEX:$\\vec{b}$");
                this.labelLine(bases[2], bases[2].add(vecs[2]), $V([1, 0]), "TEX:$\\vec{c}$");
                this.labelLine(bases[3], bases[3].add(vecs[3]), $V([1, 0]), "TEX:$\\vec{d}$");
            }*/
            if (this.getOption("showDerivatives")) {
                this.arrow(bases[0].add(vecs[0]), bases[0].add(vecs[0]).add(derivatives[0]), "velocity");
                this.arrow(bases[1].add(vecs[1]), bases[1].add(vecs[1]).add(derivatives[1]), "velocity");
                this.arrow(bases[2].add(vecs[2]), bases[2].add(vecs[2]).add(derivatives[2]), "velocity");
                this.arrow(bases[3].add(vecs[3]), bases[3].add(vecs[3]).add(derivatives[3]), "velocity");
            }
            this.circleArrow(O, 1, theta + Math.PI / 2 - omega / 2, theta + Math.PI / 2 + omega / 2, "angVel", true, 0.1);
            this.labelCircleLine(O, 1, theta + Math.PI / 2 - omega / 2, theta + Math.PI / 2 + omega / 2, $V([0, 1]), omegaText, true);
            this.restore();
        }

        if (this.getOption("showFixed")) {
            this.save();
            this.translate($V([3, 0]));
            this.arrow(O, vecs[0], "position");
            this.arrow(O, vecs[1], "acceleration");
            this.arrow(O, vecs[2], "angMom");
            this.arrow(O, vecs[3]);
            /*if (this.getOption("showLabels")) {
                this.labelLine(O, vecs[0], $V([1, 0]), "TEX:$\\vec{a}$");
                this.labelLine(O, vecs[1], $V([1, 0]), "TEX:$\\vec{b}$");
                this.labelLine(O, vecs[2], $V([1, 0]), "TEX:$\\vec{c}$");
                this.labelLine(O, vecs[3], $V([1, 0]), "TEX:$\\vec{d}$");
            }*/
            if (this.getOption("showDerivatives")) {
                this.arrow(vecs[0], vecs[0].add(derivatives[0]), "velocity");
                this.arrow(vecs[1], vecs[1].add(derivatives[1]), "velocity");
                this.arrow(vecs[2], vecs[2].add(derivatives[2]), "velocity");
                this.arrow(vecs[3], vecs[3].add(derivatives[3]), "velocity");
            }
            this.circleArrow(O, 1, Math.PI / 2 - omega / 2, Math.PI / 2 + omega / 2, "angVel", true, 0.1);
            this.labelCircleLine(O, 1, Math.PI / 2 - omega / 2, Math.PI / 2 + omega / 2, $V([0, 1]), omegaText, true);
            this.restore();
        }
    });

    rkt_fb_c = new PrairieDrawAnim("rkt-fb-c", function(t) {
        this.setUnits(6.6, 4.4);

        this.addOption("showLabels", true);
        this.addOption("showPosition", true);
        this.addOption("showVelocity", false);
        this.addOption("showAcceleration", false);
        this.addOption("showAccDecomp", false);
        this.addOption("showCenter", false);
        this.addOption("showCircle", false);
        this.addOption("showAngVel", false);
        this.addOption("showAngVelDecomp", false);

        var label = this.getOption("showLabels") ? true : undefined;

        var O = $V([0, 0, 0]);
        var rX = $V([1, 0, 0]);
        var rY = $V([0, 1, 0]);
        var rZ = $V([0, 0, 1]);
        var gS = 2; // ground size

        var groundBorder = [$V([-gS, -gS, 0]), $V([-gS, gS, 0]), $V([gS, gS, 0]), $V([gS, -gS, 0])];
        var nGrid = 3;
        for (var i = -nGrid; i <= nGrid; i++) {
            this.line($V([i / nGrid * gS, -gS, 0]), $V([i / nGrid * gS, gS, 0]), "grid");
            this.line($V([-gS, i / nGrid * gS, 0]), $V([gS, i / nGrid * gS, 0]), "grid");
        }
        this.polyLine(groundBorder, true, false);
        this.arrow(O, rX);
        this.arrow(O, rY);
        this.arrow(O, rZ);
        if (this.getOption("showLabels")) {
            this.labelLine(O, rX, $V([1, -1]), "TEX:$x$");
            this.labelLine(O, rY, $V([1, 1]), "TEX:$y$");
            this.labelLine(O, rZ, $V([1, 1]), "TEX:$z$");
        }

        var f = function(t) {
            return {
                P: $V([1.8 * Math.cos(t / 2), 1.8 * Math.sin(t / 2), 1 - 0.9 * Math.cos(t)])
            };
        }

        var basis = function(t) {
            var val = this.numDiff(f, t);

            var b = {};
            b.r = val.P;
            b.v = val.diff.P;
            b.a = val.ddiff.P;

            b.et = b.v.toUnitVector();
            b.en = this.orthComp(b.a, b.v).toUnitVector();
            b.eb = b.et.cross(b.en);
            return b;
        }.bind(this);

        var b = this.numDiff(basis, t);
        var r = b.r;
        var v = b.v;
        var a = b.a;
        var et = b.et;
        var en = b.en;
        var eb = b.eb;

        var at = this.orthProj(a, et);
        var an = this.orthProj(a, en);

        var rho = Math.pow(v.modulus(), 2) / an.modulus();
        var kappa = 1 / rho;
        var C = r.add(en.x(rho));

        var ebDot = b.diff.eb;
        var tau = -ebDot.dot(en) / v.modulus();
        var omega = et.x(tau * v.modulus()).add(eb.x(kappa * v.modulus()));
        var omegat = this.orthProj(omega, et);
        var omegab = this.orthProj(omega, eb);

        var path = [];
        var nPoints = 100;
        for (var i = 0; i < nPoints; i++) {
            var tTemp = i / nPoints * 4 * Math.PI;
            path.push(f(tTemp).P);
        }
        this.polyLine(path, true, false);

        this.point(r);
        this.arrow(r, r.add(et));
        this.arrow(r, r.add(en));
        this.arrow(r, r.add(eb));
        this.labelLine(r, r.add(et), $V([1, 0]), label && "TEX:$\\hat{e}_t$");
        this.labelLine(r, r.add(en), $V([1, 0]), label && "TEX:$\\hat{e}_n$");
        this.labelLine(r, r.add(eb), $V([1, 0]), label && "TEX:$\\hat{e}_b$");
        if (this.getOption("showCircle")) {
            this.save();
            this.setProp("shapeOutlineColor", this.getProp("rotationColor"));
            this.arc3D(C, rho, eb);
            this.restore();
        }
        if (this.getOption("showCenter")) {
            this.save();
            this.setProp("shapeOutlineColor", this.getProp("rotationColor"));
            this.line(C, r);
            this.labelLine(C, r, $V([0, 1]), label && "TEX:$\\rho$");
            this.point(C);
            this.labelIntersection(C, [r], label && "TEX:$C$");
            this.restore();
        }

        if (this.getOption("showPosition")) {
            this.arrow(O, r, "position");
            this.labelLine(O, r, $V([0, 1]), label && "TEX:$\\vec{r}$");
        }
        if (this.getOption("showVelocity")) {
            this.arrow(r, r.add(v), "velocity");
            this.labelLine(r, r.add(v), $V([0, 1]), label && "TEX:$\\vec{v}$");
        }
        if (this.getOption("showAcceleration")) {
            this.arrow(r, r.add(a), "acceleration");
            this.labelLine(r, r.add(a), $V([0, 1]), label && "TEX:$\\vec{a}$");
        }
        if (this.getOption("showAccDecomp")) {
            this.arrow(r, r.add(at), "acceleration");
            this.arrow(r, r.add(an), "acceleration");
            this.labelLine(r, r.add(at), $V([0, 1]), label && "TEX:$\\vec{a}_t$");
            this.labelLine(r, r.add(an), $V([0, 1]), label && "TEX:$\\vec{a}_n$");
        }
        if (this.getOption("showAngVel")) {
            this.arrow(r, r.add(omega), "angVel");
            this.labelLine(r, r.add(omega), $V([0, 1]), label && "TEX:$\\vec\\omega$");
        }
        if (this.getOption("showAngVelDecomp")) {
            this.arrow(r, r.add(omegat), "angVel");
            this.arrow(r, r.add(omegab), "angVel");
            this.labelLine(r, r.add(omegat), $V([0, 1]), label && "TEX:$\\vec\\omega_t$");
            this.labelLine(r, r.add(omegab), $V([0, 1]), label && "TEX:$\\vec\\omega_b$");
        }
    });

    rkt_fb_c.activate3DControl();

    rkt_ft_c = new PrairieDrawAnim("rkt-ft-c", function(t) {
        this.setUnits(12, 8);

        this.addOption("movement", "circle");
        this.addOption("showLabels", true);
        this.addOption("showPath", false);
        this.addOption("showCenter", false);
        this.addOption("showCircle", false);
        this.addOption("showPosition", true);
        this.addOption("showVelocity", false);
        this.addOption("showAcceleration", false);
        this.addOption("showAccDecomp", false);
        this.addOption("showAngVel", false);
        this.addOption("origin", "O1");

        var f;
        if (this.getOption("movement") === "arc") {
            f = function(t) {
                t = -t;
                t += 5;
                return {
                    "period": 2 * Math.PI / 0.5,
                    "P": this.polarToRect($V([2 - 0.5 * Math.cos(0.5 * t) - 0.5 * Math.cos(t), Math.PI / 2 + 2.5 * Math.sin(0.5 * t)]))
                };
            };
        } else if (this.getOption("movement") === "circle") {
            f = function(t) {
                return {
                    "period": 2 * Math.PI / 0.5,
                    "P": this.polarToRect($V([2.5, 0.5 * t]))
                };
            };
        } else if (this.getOption("movement") === "varCircle") {
            f = function(t) {
                return {
                    "period": 2 * Math.PI / 0.5,
                    "P": this.polarToRect($V([2.5, -0.5 * t + 0.2 * Math.sin(t)]))
                };
            };
        } else if (this.getOption("movement") === "ellipse") {
            f = function(t) {
                t += 3;
                return {
                    "period": 2 * Math.PI / 0.7,
                    "P": $V([Math.cos(0.7 * t), 3 * Math.sin(0.7 * t)])
                };
            };
        } else if (this.getOption("movement") === "trefoil") {
            f = function(t) {
                t += 4;
                return {
                    "period": 2 * Math.PI / 0.4,
                    "P": $V([Math.cos(0.4 * t) - 2 * Math.cos(2 * 0.4 * t), Math.sin(0.4 * t) + 2 * Math.sin(2 * 0.4 * t)])
                };
            };
        } else if (this.getOption("movement") === "eight") {
            f = function(t) {
                t += 2.5 * Math.PI;
                return {
                    "period": 2 * Math.PI / 0.5,
                    "P": this.polarToRect($V([3 * Math.cos(0.5 * t), Math.sin(0.5 * t)]))
                };
            };
        } else if (this.getOption("movement") === "comet") {
            f = function(t) {
                t += 1;
                var T = 2 * Math.PI / 0.7; // period
                var a = 2; // semi-major axis
                var e = 0.5; // eccentricity
                var b = a * Math.sqrt(1 - e*e); // semi-minor axis
                var M = 2 * Math.PI * t / T; // mean anomaly
                var E = M; // eccentric anomaly
                // solve M = E - e * sin(E) for E with Newton's method
                for (var i = 0; i < 5; i++) {
                    E = E + (M - (E - e * Math.sin(E))) / (1 - e * Math.cos(E));
                }
                return {
                "period": T,
                "P": $V([a * (Math.cos(E) - e), b * Math.sin(E)])
            };};
        } else if (this.getOption("movement") === "pendulum") {
            f = function(t) {
                t -= 1.5;
                return {
                    "period": 2 * Math.PI / 0.6,
                    "P": this.polarToRect($V([2.5, -Math.PI / 2 + Math.cos(0.6 * t)]))
                };
            };
        }
        f = f.bind(this);

        var O1 = $V([0, 0]);
        var O2 = $V([-3, -2]);

        var O;
        if (this.getOption("origin") === "O1") {
            O = O1;
        } else {
            O = O2;
        }

        var val = this.numDiff(f, t);
        var period = val.period;
        var r = val.P;
        var v = val.diff.P;
        var a = val.ddiff.P;

        var ei = $V([1, 0]);
        var ej = $V([0, 1]);

        var et = v.toUnitVector();
        var en = this.orthComp(a, v).toUnitVector();

        var vt = this.orthProj(v, et);
        var vn = this.orthProj(v, en);
        var at = this.orthProj(a, et);
        var an = this.orthProj(a, en);

        var label = this.getOption("showLabels") ? true : undefined;

        var rho = Math.pow(v.modulus(), 2) / an.modulus();
        var C = r.add(en.x(rho));

        var kappa = 1 / rho;
        var omega = v.modulus() * kappa;

        if (this.getOption("showPath")) {
            var n = 200;
            var path = [], s;
            for (var i = 0; i < n; i++) {
                s = i / n * period;
                path.push(f(s).P);
            }
            this.polyLine(path, true, false);
        }
        this.point(O1);
        this.text(O1, $V([1, 1]), label && "TEX:$O_1$");
        this.point(O2);
        this.text(O2, $V([1, 1]), label && "TEX:$O_2$");
        this.point(r);
        this.labelIntersection(r, [O, r.add(et), r.add(en)], label && "TEX:$P$");
        if (this.getOption("showCircle")) {
            this.save();
            this.setProp("shapeOutlineColor", this.getProp("rotationColor"));
            this.arc(C, rho);
            this.restore();
        }
        if (this.getOption("showCenter")) {
            this.save();
            this.setProp("shapeOutlineColor", this.getProp("rotationColor"));
            this.line(C, r);
            this.labelLine(C, r, $V([0, 1]), label && "TEX:$\\rho$");
            this.point(C);
            this.labelIntersection(C, [r], label && "TEX:$C$");
            this.restore();
        }
        if (this.getOption("showPosition")) {
            this.arrow(O, r, "position");
            this.labelLine(O, r, $V([0, 1]), label && "TEX:$\\vec{r}$");
        }
        this.arrow(r, r.add(et));
        this.arrow(r, r.add(en));
        this.labelLine(r, r.add(et), $V([1, 1]), label && "TEX:$\\hat{e}_t$");
        this.labelLine(r, r.add(en), $V([1, 1]), label && "TEX:$\\hat{e}_n$");
        if (this.getOption("showVelocity")) {
            this.arrow(r, r.add(v), "velocity");
            this.labelLine(r, r.add(v), $V([0, -1]), label && "TEX:$\\vec{v}$");
        }
        if (this.getOption("showAcceleration")) {
            this.arrow(r, r.add(a), "acceleration");
            this.labelLine(r, r.add(a), $V([1, 0]), label && "TEX:$\\vec{a}$");
        }
        if (this.getOption("showAccDecomp") && at.modulus() > 1e-3) {
            this.arrow(r, r.add(at), "acceleration");
            this.labelLine(r, r.add(at), $V([1, 1]), label && "TEX:$\\vec{a}_t$");
        }
        if (this.getOption("showAccDecomp") && an.modulus() > 1e-3) {
            this.arrow(r, r.add(an), "acceleration");
            this.labelLine(r, r.add(an), $V([1, 1]), label && "TEX:$\\vec{a}_n$");
        }
        if (this.getOption("showAngVel") && Math.abs(omega) > 1e-3) {
            var ebSign = et.to3D().cross(en.to3D()).dot(Vector.k);
            var avOffset = (this.getOption("showPath") || this.getOption("showCircle")) ? Math.PI / 2 : 3 * Math.PI / 4;
            var a0 = this.angleOf(et) - ebSign * omega - ebSign * avOffset;
            var a1 = this.angleOf(et) + ebSign * omega - ebSign * avOffset;
            var omegaLabel = (ebSign > 0) ? "TEX:$\\omega$" : "TEX:$-\\omega$";
            this.circleArrow(r, 0.6, a0, a1, "angVel");
            this.labelCircleLine(r, 0.6, a0, a1, $V([0, 1]), label && omegaLabel);
        }
    });

    rkt_ft_c.registerOptionCallback("movement", function (value) {
        rkt_ft_c.resetTime(false);
        rkt_ft_c.resetOptionValue("showPath");
        rkt_ft_c.resetOptionValue("showVelocity");
        rkt_ft_c.resetOptionValue("showAcceleration");
        rkt_ft_c.resetOptionValue("showAccDecomp");
        rkt_ft_c.resetOptionValue("showCenter");
        rkt_ft_c.resetOptionValue("showCircle");
    });

    rkt_ft_c.registerOptionCallback("origin", function (value) {
        rkt_ft_c.setOption("showPosition", true);
    });

    aov_fe_c = new PrairieDrawAnim("aov-fe-c", function(t) {
        this.setUnits(40, 20);

        var daysInYear = 8; // solar days
        var omega = 0.5; // orbital angular velocity
        var orbitRad = 8;
        var earthRad = 1;
        var sunRad = 2;
        var starRad = 0.8;
        var sunColor = "rgb(200, 150, 0)";
        var starColor = "rgb(0, 100, 150)";

        var states = [];
        var transTimes = [];
        var holdTimes = [];
        var interps = {};
        var names = [];
        var i, theta0, theta1;
        var that = this;
        var thetaOfState = function(iState) {
            if (iState % 2 === 0) {
                // solar day
                return that.linearInterp(0, 2 * Math.PI, iState / 2 / daysInYear);
            } else {
                // sidereal day
                return that.linearInterp(0, 2 * Math.PI, (iState + 1) / 2 / (daysInYear + 1));
            }
        };
        for (i = 0; i <= 2 * daysInYear; i++) {
            theta0 = thetaOfState(i);
            theta1 = thetaOfState(i + 1);
            states.push({"theta": theta0});
            transTimes.push((theta1 - theta0) / omega);
            if (i === 0) {
                holdTimes.push(0);
            } else if (i === 2 * daysInYear) {
                holdTimes.push(1);
            } else {
                holdTimes.push(0.2);
            }
            names.push("");
        }

        var state = this.newSequence("motion", states, transTimes, holdTimes, interps, names, t);
        i = state.index;
        theta = state.theta;
        var earthTheta = theta * (daysInYear + 1);

        var O = $V([0, 0]);
        var P = $V([Math.cos(theta), Math.sin(theta)]).x(orbitRad);

        // stars
        var drawStar = function(pos) {
            that.save();
            that.translate(pos);
            that.setProp("shapeOutlineColor", starColor);
            that.line($V([-starRad, 0]), $V([starRad, 0]));
            that.line($V([0, -starRad]), $V([0, starRad]));
            that.line($V([-starRad * 0.7, -starRad * 0.7]), $V([starRad * 0.7, starRad * 0.7]));
            that.line($V([starRad * 0.7, -starRad * 0.7]), $V([-starRad * 0.7, starRad * 0.7]));
            that.restore();
        }
        drawStar($V([-18, 5]));
        drawStar($V([-16, 8]));
        drawStar($V([-17, -8]));
        drawStar($V([-15, 2]));
        drawStar($V([-16.5, -1]));
        drawStar($V([-15.5, 4]));
        drawStar($V([-17.5, 7]));
        drawStar($V([-15.2, -6]));
        drawStar($V([-16.3, -3]));
        drawStar($V([-17.4, -7]));

        // earth-sun system
        this.save();
        this.translate($V([10, 0]));

        // line to sun
        if (!state.inTransition && i % 2 === 0 && i > 0) {
            this.save();
            if (i === 2 * daysInYear) {
                this.setProp("shapeOutlineColor", starColor);
                this.line(P, $V([-40, P.e(2)]));
            }
            this.setProp("shapeOutlineColor", sunColor);
            this.line(O, P);
            this.restore();
        }

        // line to stars
        if (!state.inTransition && i % 2 === 1) {
            this.save();
            this.setProp("shapeOutlineColor", starColor);
            this.line(P, $V([-40, P.e(2)]));
            this.restore();
        }

        // sun
        this.save();
        this.setProp("pointRadiusPx", 20);
        this.setProp("shapeInsideColor", "rgb(255, 255, 0)");
        this.setProp("shapeOutlineColor", sunColor);
        this.arc(O, sunRad, undefined, undefined, true);
        this.restore();

        // earth
        this.save();
        this.translate(P);
        this.rotate(earthTheta);
        this.arc(O, earthRad);
        this.arrow(O, $V([-2.2 * earthRad, 0]));
        this.restore();

        this.restore(); // end of earth-sun system

        var iSolar = Math.floor(i / 2);
        var iSidereal = Math.floor((i + 1) / 2) + Math.floor(i / 2 / daysInYear);
        this.save();
        this._ctx.font = "16px sans-serif";
        this.text($V([-12, 7.5]), $V([-1,-1]), "Solar days: " + iSolar.toFixed());
        this.text($V([-12, 6]), $V([-1,-1]), "Sidereal days: " + iSidereal.toFixed());
        this.restore();
    });

    aov_fd_c = new PrairieDrawAnim("aov-fd-c", function(t) {
        this.setUnits(40, 20);

        var daysInYear = 8; // solar days
        var orbitRad = 16;
        var earthRad = 1;
        var sunRad = 2;
        var starRad = 0.8;
        var sunColor = "rgb(200, 150, 0)";
        var starColor = "rgb(0, 100, 150)";

        var theta0 = 0;
        var theta1 = Math.PI / 8;
        var theta2 = Math.PI / 5;

        var earthTheta0 = 0;
        var earthTheta1 = 0;
        var earthTheta2 = theta2;

        var O = $V([0, 0]);
        var P0 = $V([1, 0]).x(orbitRad);
        var P1 = $V([Math.cos(theta1), Math.sin(theta1)]).x(orbitRad);
        var P2 = $V([Math.cos(theta2), Math.sin(theta2)]).x(orbitRad);

        // earth-sun system
        this.save();
        this.translate($V([-11, -5]));

        // line to stars
        this.save();
        this.setProp("shapeOutlineColor", starColor);
        this.line(P0, $V([-40, P0.e(2)]));
        this.line(P1, $V([-40, P1.e(2)]));
        this.setProp("shapeOutlineColor", "black");
        this.setProp("shapeStrokePattern", "dashed");
        this.line(P2, $V([-40, P2.e(2)]));
        this.restore();

        // line to sun
        this.save();
        this.setProp("shapeOutlineColor", sunColor);
        this.line(O, P0);
        this.line(O, P2);
        this.setProp("shapeOutlineColor", "black");
        this.setProp("shapeStrokePattern", "dashed");
        this.line(O, P1);
        this.line(P0, P0.add(P0.toUnitVector().x(6 * earthRad)));
        this.line(P1, P1.add(P1.toUnitVector().x(6 * earthRad)));
        this.line(P2, P2.add(P2.toUnitVector().x(6 * earthRad)));
        this.restore();

        // sun
        this.save();
        this.setProp("pointRadiusPx", 20);
        this.setProp("shapeInsideColor", "rgb(255, 255, 0)");
        this.setProp("shapeOutlineColor", sunColor);
        this.arc(O, sunRad, undefined, undefined, true);
        this.restore();

        // earths
        var Ps = [P0, P1, P2];
        var thetas = [theta0, theta1, theta2];
        var earthThetas = [earthTheta0, earthTheta1, earthTheta2];
        for (i = 0; i < 3; i++) {
            this.save();
            this.translate(Ps[i]);
            this.arc(O, earthRad, undefined, undefined, true);
            this.save();
            this.rotate(earthThetas[i]);
            this.arrow(O, $V([-2.2 * earthRad, 0]));
            this.restore();
            this.save();
            this.rotate(thetas[i]);
            this.circleArrow(O, 2 * earthRad, -1, 1, "angVel", true);
            if (i === 0) {
                this.labelCircleLine(O, 2 * earthRad, -1, 1, $V([-1, 1]), "TEX:$\\omega_{\\rm E}$", true);
            }
            this.restore();
            this.restore();
        }

        // days
        this.circleArrow(O, orbitRad + 4 * earthRad, 0, theta2, undefined, true, 0.02);
        this.labelCircleLine(O, orbitRad + 4 * earthRad, 0, theta2, $V([0.6, 1.3]), "TEX:solar day", true);
        this.circleArrow(O, orbitRad + 5 * earthRad, 0, theta1, undefined, true, 0.02);
        this.labelCircleLine(O, orbitRad + 5 * earthRad, 0, theta1, $V([0, 1.1]), "TEX:sidereal day", true);

        // orbital velocity
        this.circleArrow(O, 3 * sunRad, -0.3, 1, "angVel", true, 0.05);
        this.labelCircleLine(O, 3 * sunRad, -0.3, 1, $V([-1, 0]), "TEX:$\\omega_{\\rm S}$", true);

        this.restore(); // end of earth-sun system
    });

    $( window ).on( "resize", function() {
        rkt_fb_c.redraw();
        rkr_fg_c.redraw();
        rkr_fe_c.redraw();
        rkr_fc_c.redraw();
        rkt_ft_c.redraw();
        aov_fe_c.redraw();
        aov_fd_c.redraw();
    } );

}); // end of document.ready()
