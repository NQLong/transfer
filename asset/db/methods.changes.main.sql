CREATE OR REPLACE FUNCTION HCTH_GIAO_NHIEM_VU_SEARCH_PAGE(
    pageNumber IN OUT NUMBER,
    pageSize IN OUT NUMBER,
    userId IN STRING,
    maDonVi IN STRING,
    donViNhan in STRING,
    canBoNhan IN STRING,
    searchTerm IN STRING,
    totalItem OUT NUMBER,
    pageTotal OUT NUMBER
) RETURN SYS_REFCURSOR AS
my_cursor SYS_REFCURSOR;
sT STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
SELECT COUNT(*) INTO totalItem
FROM HCTH_GIAO_NHIEM_VU hcthgnv
LEFT JOIN HCTH_CAN_BO_NHAN hcthcbn ON hcthcbn.KEY = hcthgnv.ID AND hcthcbn.LOAI = 'NHIEM_VU'
WHERE
    ((
        userId is not null AND hcthgnv.NGUOI_TAO = userId
    ) OR
    (
        hcthcbn.CAN_BO_NHAN IS NOT NULL AND
        INSTR(hcthcbn.CAN_BO_NHAN, userId) != 0
     ) OR
     (
        userId is null
    ))
    AND
    ((
        donViNhan IS NULL
        AND canBoNhan IS NULL
    )
    OR (
        canBoNhan is NOT NULL
        AND INSTR(hcthcbn.CAN_BO_NHAN, canBoNhan) != 0
    )
    OR (
        donViNhan IS NOT NULL
        AND hcthgnv.DON_VI_NHAN is not NULL
        AND (
            (
                select count(id2)
                from (
                        select *
                        from (
                                (
                                    SELECT to_number(COLUMN_VALUE) as id1
                                    FROM xmltable(donViNhan)
                                    ORDER BY id1
                                ) t1
                                LEFT JOIN (
                                    SELECT to_number(COLUMN_VALUE) as id2
                                    FROM xmltable(hcthgnv.DON_VI_NHAN)
                                    ORDER BY id2
                                ) t2 ON id1 = id2
                            )
                    )
            ) != 0
        )
    ))
    AND (
        sT = ''
        OR LOWER(hcthgnv.NOI_DUNG) LIKE sT
    )
    ;
IF pageNumber < 1 THEN pageNumber := 1;
END IF;
IF pageSize < 1 THEN pageSize := 1;
END IF;
pageTotal := CEIL(totalItem / pageSize);
pageNumber := LEAST(pageNumber, pageTotal);
-- if donVi is NOT NULL then SELECT to_number(COLUMN_VALUE) as id1 into "hcthCongVanDenSearchDonvi"
--                                             FROM xmltable(donVi)
--                                             ORDER BY id1 ASC;
--
-- end if;
OPEN my_cursor FOR
SELECT *
FROM (
        SELECT  hcthgnv.ID              AS "id",
                hcthgnv.TIEU_DE         AS "tieuDe",
                hcthgnv.NOI_DUNG        AS "noiDung",
                hcthgnv.NGAY_BAT_DAU    AS "ngayBatDau",
                hcthgnv.NGAY_KET_THUC   AS "ngayKetThuc",
                hcthgnv.NGAY_TAO        AS "ngayTao",
                hcthgnv.DO_UU_TIEN      AS "doUuTien",
                hcthgnv.DON_VI_NHAN     AS "maDonViNhan",
                hcthcbn.CAN_BO_NHAN     AS "maCanBoNhan",
                hcthgnv.NGUOI_TAO       AS "nguoiTao",
                hcthgnv.IS_NHIEM_VU_LIEN_PHONG       AS "isNhiemVuLienPhong",
            CASE
                WHEN hcthgnv.DON_VI_NHAN IS NULL then NULL
                ELSE (
                    SELECT LISTAGG(dvn.TEN, '; ') WITHIN GROUP (
                            order by dvn.TEN
                        )
                    FROM DM_DON_VI dvn
                    WHERE (
                            (
                                SELECT Count(*)
                                from (
                                        select to_number(column_value) as IDs
                                        from xmltable(hcthgnv.DON_VI_NHAN)
                                    )
                                where IDs = dvn.MA
                            ) != 0
                        )
                )
            END AS "danhSachDonViNhan",


            CASE when hcthcbn.CAN_BO_NHAN is not null then
               (
                SELECT LISTAGG(
                        CASE
                            WHEN cbn.HO IS NULL THEN cbn.TEN
                            WHEN cbn.TEN IS NULL THEN cbn.HO
                            WHEN DMCV.TEN IS NULL THEN CONCAT(CONCAT(cbn.HO, ' '), cbn.TEN)
                            ELSE CONCAT(CONCAT(CONCAT(DMCV.TEN, ' - '), CONCAT(cbn.HO, ' ')), cbn.TEN)
                        END,
                        '; '
                    ) WITHIN GROUP (
                        order by cbn.TEN
                    ) as hoVaTenCanBo
                FROM TCHC_CAN_BO cbn
                LEFT JOIN QT_CHUC_VU qtcv ON cbn.SHCC = qtcv.SHCC AND CHUC_VU_CHINH = 1
                LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = qtcv.MA_CHUC_VU
                WHERE INSTR(CONCAT(hcthcbn.CAN_BO_NHAN,','), CONCAT( cbn.shcc, ',')) != 0
            ) ELSE NULL END AS "danhSachCanBoNhan",

            CASE when hcthgnv.NGUOI_TAO is not null then
            (
                SELECT (
                        CASE
                            WHEN cbn.HO IS NULL THEN cbn.TEN
                            WHEN cbn.TEN IS NULL THEN cbn.HO
                            ELSE CONCAT(CONCAT(cbn.HO, ' '), cbn.TEN)
                        END
                )
                FROM TCHC_CAN_BO cbn
                WHERE hcthgnv.NGUOI_TAO = cbn.shcc
            ) ELSE NULL END AS "tenNguoiTao",

            ROW_NUMBER() OVER (
                ORDER BY hcthgnv.ID DESC
            ) R
        FROM HCTH_GIAO_NHIEM_VU hcthgnv
        LEFT JOIN HCTH_CAN_BO_NHAN hcthcbn ON hcthcbn.KEY = hcthgnv.ID AND hcthcbn.LOAI = 'NHIEM_VU'
        WHERE
        ((
            userId is not null and
            hcthgnv.NGUOI_TAO = userId
        ) OR
        (
            hcthcbn.CAN_BO_NHAN IS NOT NULL AND
            INSTR(hcthcbn.CAN_BO_NHAN, userId) != 0
        ) OR
        (
             userId is null
        ))
        AND
        (
            (
                canBoNhan IS NULL
                AND donViNhan IS NULL
            )
            OR (
                canBoNhan is NOT NULL
                AND INSTR(hcthcbn.CAN_BO_NHAN, canBoNhan) != 0
            )
            OR (
                donViNhan IS NOT NULL
                AND hcthgnv.DON_VI_NHAN is not NULL
                AND (
                    (
                        select count(id2)
                        from (
                                select *
                                from (
                                        (
                                            SELECT to_number(COLUMN_VALUE) as id1
                                            FROM xmltable(donViNhan)
                                            ORDER BY id1
                                        ) t1
                                        LEFT JOIN (
                                            SELECT to_number(COLUMN_VALUE) as id2
                                            FROM xmltable(hcthgnv.DON_VI_NHAN)
                                            ORDER BY id2
                                        ) t2 ON id1 = id2
                                    )
                            )
                    ) != 0
                )
            ))
        AND (
            sT = ''
            OR LOWER(hcthgnv.NOI_DUNG) LIKE sT
            )
        ORDER BY hcthgnv.ID DESC
    )
WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize
ORDER BY 'id' DESC;
RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_DI_NUOC_NGOAI_DOWNLOAD_EXCEL(filter IN STRING, searchTerm IN STRING) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
    today     NUMBER(20);
    list_shcc STRING(100);
    list_dv STRING(100);
    fromYear NUMBER;
    toYear NUMBER;
    timeType NUMBER;
    loaiHocVi STRING(100);
    mucDich STRING(100);
    tinhTrangCongTac NUMBER;
    tinhTrangBaoCao NUMBER;
BEGIN
    /* Init filter */-------------------------------------------------------------------------------------
    SELECT JSON_VALUE(filter, '$.listDv') INTO list_dv FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listShcc') INTO list_shcc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromYear') INTO fromYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toYear') INTO toYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.timeType') INTO timeType FROM DUAL;
    SELECT JSON_VALUE(filter, '$.loaiHocVi') INTO loaiHocVi FROM DUAL;
    SELECT JSON_VALUE(filter, '$.mucDich') INTO mucDich FROM DUAL;
    SELECT JSON_VALUE(filter, '$.tinhTrangCongTac') INTO tinhTrangCongTac FROM DUAL;
    SELECT JSON_VALUE(filter, '$.tinhTrangBaoCao') INTO tinhTrangBaoCao FROM DUAL;

    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtdnn.ID               AS                  "id",
                        qtdnn.NOI_DUNG         AS                  "noiDung",
                        qtdnn.QUOC_GIA         AS                  "quocGia",
                        qtdnn.SHCC             AS                  "shcc",
                        qtdnn.MUC_DICH  AS "mucDich",
                        qtdnn.NGAY_DI   AS "ngayDi",
                        qtdnn.NGAY_DI_TYPE  AS "ngayDiType",
                        qtdnn.NGAY_VE   AS "ngayVe",
                        qtdnn.NGAY_VE_TYPE  AS "ngayVeType",
                        qtdnn.CHI_PHI   AS "chiPhi",
                        qtdnn.GHI_CHU   AS "ghiChu",
                        qtdnn.SO_QUYET_DINH AS "soQuyetDinh",
                        qtdnn.NGAY_QUYET_DINH   AS "ngayQuyetDinh",
                        qtdnn.SO_QD_TIEP_NHAN AS "soQdTiepNhan",
                        qtdnn.NOI_DUNG_TIEP_NHAN AS "noiDungTiepNhan",
                        tnvn.TEN AS "tenNoiDungTiepNhan",
                        qtdnn.NGAY_QD_TIEP_NHAN AS "ngayQdTiepNhan",
                        qtdnn.NGAY_VE_NUOC AS "ngayVeNuoc",
                        qtdnn.BAO_CAO_TINH_TRANG AS "baoCaoTinhTrang",
                        qtdnn.BAO_CAO_TEN AS "baoCaoTen",
                        qtdnn.BAO_CAO_LY_DO_TRA_VE AS "baoCaoLyDoTraVe",

                        (select rtrim(xmlagg(xmlelement(e, dmqg.TEN_QUOC_GIA, '-').extract('//text()') order by null).getclobval(), '-')
                         FROM DM_QUOC_GIA dmqg
                         WHERE INSTR(qtdnn.QUOC_GIA, dmqg.MA_CODE) != 0
                        ) AS "danhSachQuocGia",

                        today                 AS                  "today",
                        cb.HO                 AS                  "hoCanBo",
                        cb.TEN                AS                  "tenCanBo",
                        cb.NGAY_SINH AS "ngaySinh",
                        cb.PHAI AS "phai",

                        dv.MA                 AS                  "maDonVi",
                        dv.TEN                AS                  "tenDonVi",
                        DMDNN.MO_TA           AS    "tenMucDich",

                        cv.MA   AS "maChucVu",
                        cv.TEN  AS "tenChucVu",

                        td.MA   AS "maHocVi",
                        td.TEN  AS "tenHocVi",

                        cdnn.MA AS "maChucDanhNgheNghiep",
                        cdnn.TEN AS "tenChucDanhNgheNghiep",
                        ROW_NUMBER() OVER (ORDER BY NGAY_DI DESC) R
                FROM QT_DI_NUOC_NGOAI qtdnn
                         LEFT JOIN TCHC_CAN_BO cb on qtdnn.SHCC = cb.SHCC
                         LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                         LEFT JOIN DM_MUC_DICH_NUOC_NGOAI DMDNN on qtdnn.MUC_DICH = DMDNN.MA
                         LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                         LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                         LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                         LEFT JOIN DM_TIEP_NHAN_VE_NUOC tnvn ON (qtdnn.NOI_DUNG_TIEP_NHAN = tnvn.MA)
                WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType IS NULL) AND (tinhTrangCongTac IS NULL) AND (loaiHocVi IS NULL) AND (mucDich IS NULL) AND (tinhTrangBaoCao IS NULL))
                    OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level) from dual connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                  OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level) from dual connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                  OR (list_shcc IS NULL AND list_dv IS NULL))
                    AND (loaiHocVi IS NULL OR cb.HOC_VI IN (SELECT regexp_substr(loaiHocVi, '[^,]+', 1, level) from dual connect by regexp_substr(loaiHocVi, '[^,]+', 1, level) is not null))
                    AND (mucDich IS NULL OR qtdnn.MUC_DICH IN (SELECT regexp_substr(mucDich, '[^,]+', 1, level) from dual connect by regexp_substr(mucDich, '[^,]+', 1, level) is not null))
                    AND (timeType IS NULL OR (
                                timeType = 1 AND
                                (qtdnn.NGAY_DI IS NOT NULL AND (fromYear IS NULL OR qtdnn.NGAY_DI >= fromYear)) AND
                                (toYear IS NULL OR qtdnn.NGAY_DI <= toYear)
                        ) OR (
                            timeType = 2
                            AND (qtdnn.NGAY_VE IS NOT NULL AND (fromYear IS NULL OR qtdnn.NGAY_VE >= fromYear))
                            AND (toYear IS NULL OR qtdnn.NGAY_VE <= toYear)
                        ) OR (
                            timeType = 3
                            AND (qtdnn.NGAY_QUYET_DINH IS NOT NULL AND (fromYear IS NULL OR qtdnn.NGAY_QUYET_DINH >= fromYear))
                            AND (toYear IS NULL OR qtdnn.NGAY_QUYET_DINH <= toYear)
                        ) OR (
                            timeType = 4
                            AND (qtdnn.NGAY_QD_TIEP_NHAN IS NOT NULL AND (fromYear IS NULL OR qtdnn.NGAY_QD_TIEP_NHAN >= fromYear))
                            AND (toYear IS NULL OR qtdnn.NGAY_QD_TIEP_NHAN <= toYear)
                        ))
                    AND (tinhTrangCongTac IS NULL OR
                         (tinhTrangCongTac = 1 AND qtdnn.NGAY_VE < today and (qtdnn.SO_QD_TIEP_NHAN IS NOT NULL OR TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn.NGAY_VE - qtdnn.NGAY_DI)) < 30)) OR
                         (tinhTrangCongTac = 2 AND qtdnn.NGAY_VE < today and qtdnn.SO_QD_TIEP_NHAN IS NULL and TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn.NGAY_VE - qtdnn.NGAY_DI)) >= 30) OR
                         (tinhTrangCongTac = 3 AND qtdnn.NGAY_VE >= today AND qtdnn.NGAY_DI <= today) OR
                         (tinhTrangCongTac = 4 AND qtdnn.NGAY_DI > today))
                    AND (tinhTrangBaoCao IS NULL OR tinhTrangBaoCao = qtdnn.BAO_CAO_TINH_TRANG)
                    ))
                  AND (searchTerm = ''
                    OR LOWER(cb.SHCC) LIKE sT
                    OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                    OR LOWER(qtdnn.NOI_DUNG) LIKE sT
                    OR LOWER(qtdnn.NOI_DUNG_TIEP_NHAN) LIKE sT
                    OR LOWER(DMDNN.MO_TA) LIKE sT)
                 ORDER BY qtdnn.NGAY_DI DESC
             );
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_DI_NUOC_NGOAI_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                          filter IN STRING, searchTerm IN STRING,
                                          totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
    today     NUMBER(20);
    list_shcc STRING(100);
    list_dv STRING(100);
    fromYear NUMBER;
    toYear NUMBER;
    timeType NUMBER;
    loaiHocVi STRING(100);
    mucDich STRING(100);
    tinhTrangCongTac NUMBER;
    tinhTrangBaoCao NUMBER;
BEGIN
    /* Init filter */-------------------------------------------------------------------------------------
    SELECT JSON_VALUE(filter, '$.listDv') INTO list_dv FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listShcc') INTO list_shcc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromYear') INTO fromYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toYear') INTO toYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.timeType') INTO timeType FROM DUAL;
    SELECT JSON_VALUE(filter, '$.loaiHocVi') INTO loaiHocVi FROM DUAL;
    SELECT JSON_VALUE(filter, '$.mucDich') INTO mucDich FROM DUAL;
    SELECT JSON_VALUE(filter, '$.tinhTrangCongTac') INTO tinhTrangCongTac FROM DUAL;
    SELECT JSON_VALUE(filter, '$.tinhTrangBaoCao') INTO tinhTrangBaoCao FROM DUAL;

    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_DI_NUOC_NGOAI qtdnn
             LEFT JOIN TCHC_CAN_BO cb on qtdnn.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_MUC_DICH_NUOC_NGOAI DMDNN on qtdnn.MUC_DICH = DMDNN.MA
             LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
             LEFT JOIN DM_TIEP_NHAN_VE_NUOC tnvn ON (qtdnn.NOI_DUNG_TIEP_NHAN = tnvn.MA)
    WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType IS NULL) AND (tinhTrangCongTac IS NULL) AND (loaiHocVi IS NULL) AND (mucDich IS NULL) AND (tinhTrangBaoCao IS NULL))
        OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level) from dual connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
      OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level) from dual connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
      OR (list_shcc IS NULL AND list_dv IS NULL))
        AND (loaiHocVi IS NULL OR cb.HOC_VI IN (SELECT regexp_substr(loaiHocVi, '[^,]+', 1, level) from dual connect by regexp_substr(loaiHocVi, '[^,]+', 1, level) is not null))
        AND (mucDich IS NULL OR qtdnn.MUC_DICH IN (SELECT regexp_substr(mucDich, '[^,]+', 1, level) from dual connect by regexp_substr(mucDich, '[^,]+', 1, level) is not null))
        AND (timeType IS NULL OR (
                    timeType = 1 AND
                    (qtdnn.NGAY_DI IS NOT NULL AND (fromYear IS NULL OR qtdnn.NGAY_DI >= fromYear)) AND
                    (toYear IS NULL OR qtdnn.NGAY_DI <= toYear)
            ) OR (
                timeType = 2
                AND (qtdnn.NGAY_VE IS NOT NULL AND (fromYear IS NULL OR qtdnn.NGAY_VE >= fromYear))
                AND (toYear IS NULL OR qtdnn.NGAY_VE <= toYear)
            ) OR (
                timeType = 3
                AND (qtdnn.NGAY_QUYET_DINH IS NOT NULL AND (fromYear IS NULL OR qtdnn.NGAY_QUYET_DINH >= fromYear))
                AND (toYear IS NULL OR qtdnn.NGAY_QUYET_DINH <= toYear)
            ) OR (
                timeType = 4
                AND (qtdnn.NGAY_QD_TIEP_NHAN IS NOT NULL AND (fromYear IS NULL OR qtdnn.NGAY_QD_TIEP_NHAN >= fromYear))
                AND (toYear IS NULL OR qtdnn.NGAY_QD_TIEP_NHAN <= toYear)
            ))
        AND (tinhTrangCongTac IS NULL OR
             (tinhTrangCongTac = 1 AND qtdnn.NGAY_VE < today and (qtdnn.SO_QD_TIEP_NHAN IS NOT NULL OR TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn.NGAY_VE - qtdnn.NGAY_DI)) < 30)) OR
             (tinhTrangCongTac = 2 AND qtdnn.NGAY_VE < today and qtdnn.SO_QD_TIEP_NHAN IS NULL and TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn.NGAY_VE - qtdnn.NGAY_DI)) >= 30) OR
             (tinhTrangCongTac = 3 AND qtdnn.NGAY_VE >= today AND qtdnn.NGAY_DI <= today) OR
             (tinhTrangCongTac = 4 AND qtdnn.NGAY_DI > today))
        AND (tinhTrangBaoCao IS NULL OR tinhTrangBaoCao = qtdnn.BAO_CAO_TINH_TRANG)
        ))
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE sT
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
        OR LOWER(qtdnn.NOI_DUNG) LIKE sT
        OR LOWER(qtdnn.NOI_DUNG_TIEP_NHAN) LIKE sT
        OR LOWER(DMDNN.MO_TA) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtdnn.ID               AS                  "id",
                        qtdnn.NOI_DUNG         AS                  "noiDung",
                        qtdnn.QUOC_GIA         AS                  "quocGia",
                        qtdnn.SHCC             AS                  "shcc",
                        qtdnn.MUC_DICH  AS "mucDich",
                        qtdnn.NGAY_DI   AS "ngayDi",
                        qtdnn.NGAY_DI_TYPE  AS "ngayDiType",
                        qtdnn.NGAY_VE   AS "ngayVe",
                        qtdnn.NGAY_VE_TYPE  AS "ngayVeType",
                        qtdnn.CHI_PHI   AS "chiPhi",
                        qtdnn.GHI_CHU   AS "ghiChu",
                        qtdnn.SO_QUYET_DINH AS "soQuyetDinh",
                        qtdnn.NGAY_QUYET_DINH   AS "ngayQuyetDinh",
                        qtdnn.SO_QD_TIEP_NHAN AS "soQdTiepNhan",
                        qtdnn.NOI_DUNG_TIEP_NHAN AS "noiDungTiepNhan",
                        tnvn.TEN AS "tenNoiDungTiepNhan",
                        qtdnn.NGAY_QD_TIEP_NHAN AS "ngayQdTiepNhan",
                        qtdnn.NGAY_VE_NUOC AS "ngayVeNuoc",
                        qtdnn.BAO_CAO_TINH_TRANG AS "baoCaoTinhTrang",
                        qtdnn.BAO_CAO_TEN AS "baoCaoTen",
                        qtdnn.BAO_CAO_LY_DO_TRA_VE AS "baoCaoLyDoTraVe",

                        (select rtrim(xmlagg(xmlelement(e, dmqg.TEN_QUOC_GIA, '-').extract('//text()') order by null).getclobval(), '-')
                         FROM DM_QUOC_GIA dmqg
                         WHERE INSTR(qtdnn.QUOC_GIA, dmqg.MA_CODE) != 0
                        ) AS "danhSachQuocGia",

                        today                 AS                  "today",
                        cb.HO                 AS                  "hoCanBo",
                        cb.TEN                AS                  "tenCanBo",

                        dv.MA                 AS                  "maDonVi",
                        dv.TEN                AS                  "tenDonVi",
                        DMDNN.MO_TA           AS    "tenMucDich",

                        cv.MA   AS "maChucVu",
                        cv.TEN  AS "tenChucVu",

                        td.MA   AS "maHocVi",
                        td.TEN  AS "tenHocVi",

                        cdnn.MA AS "maChucDanhNgheNghiep",
                        cdnn.TEN AS "tenChucDanhNgheNghiep",
                        ROW_NUMBER() OVER (ORDER BY NGAY_DI DESC) R
                FROM QT_DI_NUOC_NGOAI qtdnn
                         LEFT JOIN TCHC_CAN_BO cb on qtdnn.SHCC = cb.SHCC
                         LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                         LEFT JOIN DM_MUC_DICH_NUOC_NGOAI DMDNN on qtdnn.MUC_DICH = DMDNN.MA
                         LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                         LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                         LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                         LEFT JOIN DM_TIEP_NHAN_VE_NUOC tnvn ON (qtdnn.NOI_DUNG_TIEP_NHAN = tnvn.MA)
                WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType IS NULL) AND (tinhTrangCongTac IS NULL) AND (loaiHocVi IS NULL) AND (mucDich IS NULL) AND (tinhTrangBaoCao IS NULL))
                    OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level) from dual connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                  OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level) from dual connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                  OR (list_shcc IS NULL AND list_dv IS NULL))
                    AND (loaiHocVi IS NULL OR cb.HOC_VI IN (SELECT regexp_substr(loaiHocVi, '[^,]+', 1, level) from dual connect by regexp_substr(loaiHocVi, '[^,]+', 1, level) is not null))
                    AND (mucDich IS NULL OR qtdnn.MUC_DICH IN (SELECT regexp_substr(mucDich, '[^,]+', 1, level) from dual connect by regexp_substr(mucDich, '[^,]+', 1, level) is not null))
                    AND (timeType IS NULL OR (
                                timeType = 1 AND
                                (qtdnn.NGAY_DI IS NOT NULL AND (fromYear IS NULL OR qtdnn.NGAY_DI >= fromYear)) AND
                                (toYear IS NULL OR qtdnn.NGAY_DI <= toYear)
                        ) OR (
                            timeType = 2
                            AND (qtdnn.NGAY_VE IS NOT NULL AND (fromYear IS NULL OR qtdnn.NGAY_VE >= fromYear))
                            AND (toYear IS NULL OR qtdnn.NGAY_VE <= toYear)
                        ) OR (
                            timeType = 3
                            AND (qtdnn.NGAY_QUYET_DINH IS NOT NULL AND (fromYear IS NULL OR qtdnn.NGAY_QUYET_DINH >= fromYear))
                            AND (toYear IS NULL OR qtdnn.NGAY_QUYET_DINH <= toYear)
                        ) OR (
                            timeType = 4
                            AND (qtdnn.NGAY_QD_TIEP_NHAN IS NOT NULL AND (fromYear IS NULL OR qtdnn.NGAY_QD_TIEP_NHAN >= fromYear))
                            AND (toYear IS NULL OR qtdnn.NGAY_QD_TIEP_NHAN <= toYear)
                        ))
                    AND (tinhTrangCongTac IS NULL OR
                         (tinhTrangCongTac = 1 AND qtdnn.NGAY_VE < today and (qtdnn.SO_QD_TIEP_NHAN IS NOT NULL OR TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn.NGAY_VE - qtdnn.NGAY_DI)) < 30)) OR
                         (tinhTrangCongTac = 2 AND qtdnn.NGAY_VE < today and qtdnn.SO_QD_TIEP_NHAN IS NULL and TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn.NGAY_VE - qtdnn.NGAY_DI)) >= 30) OR
                         (tinhTrangCongTac = 3 AND qtdnn.NGAY_VE >= today AND qtdnn.NGAY_DI <= today) OR
                         (tinhTrangCongTac = 4 AND qtdnn.NGAY_DI > today))
                    AND (tinhTrangBaoCao IS NULL OR tinhTrangBaoCao = qtdnn.BAO_CAO_TINH_TRANG)
                    ))
                  AND (searchTerm = ''
                    OR LOWER(cb.SHCC) LIKE sT
                    OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                    OR LOWER(qtdnn.NOI_DUNG) LIKE sT
                    OR LOWER(qtdnn.NOI_DUNG_TIEP_NHAN) LIKE sT
                    OR LOWER(DMDNN.MO_TA) LIKE sT)
                 ORDER BY qtdnn.NGAY_DI DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

