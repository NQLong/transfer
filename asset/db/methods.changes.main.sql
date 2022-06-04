CREATE OR REPLACE FUNCTION QT_HOP_DONG_DON_VI_TRA_LUONG_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                list_shcc IN STRING, list_dv IN STRING,
                                                fromYear IN NUMBER, toYear IN NUMBER, searchTerm IN STRING,
                                                totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem
    FROM (SELECT *
          FROM QT_HOP_DONG_DON_VI_TRA_LUONG
          WHERE ID IN
                (SELECT MAX(ID) FROM (SELECT * FROM QT_HOP_DONG_DON_VI_TRA_LUONG ORDER BY ID DESC) GROUP BY SHCC)) hd
             LEFT JOIN TCHC_CAN_BO benA on hd.SHCC = benA.SHCC
             LEFT JOIN TCHC_CAN_BO nguoiKy on hd.NGUOI_KY = nguoiKy.SHCC;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);
    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT hd.SHCC AS                   "shcc",
                        hd.ID              AS                   "id",
                        benA.HO            AS                   "hoBenA",
                        benA.TEN           AS                   "tenBenA",
                        (SELECT COUNT(*)
                        FROM QT_HOP_DONG_DON_VI_TRA_LUONG hd_temp
                                 LEFT JOIN TCHC_CAN_BO nguoiKy on hd_temp.NGUOI_KY = nguoiKy.SHCC
                                 LEFT JOIN DM_LOAI_HOP_DONG dhd ON hd_temp.LOAI_HOP_DONG = dhd.MA
                                 LEFT JOIN TCHC_CAN_BO benA ON hd_temp.SHCC = benA.SHCC
                                 LEFT JOIN DM_DON_VI dv on hd_temp.DON_VI_TRA_LUONG = dv.MA
                                 LEFT JOIN DM_NGACH_CDNN ncdnn ON hd_temp.NGACH = ncdnn.ID
                        WHERE (hd_temp.SHCC = hd.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                            OR (((list_shcc IS NOT NULL AND
                                  ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, benA.SHCC) != 0) OR (list_shcc = benA.SHCC)))
                                OR (list_dv IS NOT NULL AND INSTR(list_dv, benA.MA_DON_VI) != 0)
                                OR (list_shcc IS NULL AND list_dv IS NULL))
                                AND (hd_temp.NGAY_KY_HOP_DONG IS NOT NULL AND (fromYear IS NULL OR hd_temp.NGAY_KY_HOP_DONG >= fromYear))
                                AND (hd_temp.NGAY_KY_HOP_DONG IS NOT NULL AND (toYear IS NULL OR hd_temp.NGAY_KY_HOP_DONG <= (toYear + 86399999)))))
                          AND (searchTerm = ''
                            OR LOWER(hd_temp.NGUOI_KY) LIKE sT
                            OR LOWER(hd_temp.SHCC) LIKE sT
                            OR LOWER(TRIM(benA.HO || ' ' || benA.TEN)) LIKE sT
                            OR LOWER(TRIM(nguoiKy.HO || ' ' || nguoiKy.TEN)) LIKE sT
                            OR LOWER(hd_temp.SO_HOP_DONG) LIKE sT)
                        )                  AS                   "soHd",

                        (select rtrim(xmlagg(
                                              xmlelement(e, hd_temp.NGAY_KY_HOP_DONG || ' ', '??').extract('//text()')
                                              order by null).getclobval(), '??')
                        FROM QT_HOP_DONG_DON_VI_TRA_LUONG hd_temp
                                 LEFT JOIN TCHC_CAN_BO nguoiKy on hd_temp.NGUOI_KY = nguoiKy.SHCC
                                 LEFT JOIN DM_LOAI_HOP_DONG dhd ON hd_temp.LOAI_HOP_DONG = dhd.MA
                                 LEFT JOIN TCHC_CAN_BO benA ON hd_temp.SHCC = benA.SHCC
                                 LEFT JOIN DM_DON_VI dv on hd_temp.DON_VI_TRA_LUONG = dv.MA
                                 LEFT JOIN DM_NGACH_CDNN ncdnn ON hd_temp.NGACH = ncdnn.ID
                        WHERE (hd_temp.SHCC = hd.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                            OR (((list_shcc IS NOT NULL AND
                                  ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, benA.SHCC) != 0) OR (list_shcc = benA.SHCC)))
                                OR (list_dv IS NOT NULL AND INSTR(list_dv, benA.MA_DON_VI) != 0)
                                OR (list_shcc IS NULL AND list_dv IS NULL))
                                AND (hd_temp.NGAY_KY_HOP_DONG IS NOT NULL AND (fromYear IS NULL OR hd_temp.NGAY_KY_HOP_DONG >= fromYear))
                                AND (hd_temp.NGAY_KY_HOP_DONG IS NOT NULL AND (toYear IS NULL OR hd_temp.NGAY_KY_HOP_DONG <= (toYear + 86399999)))))
                          AND (searchTerm = ''
                            OR LOWER(hd_temp.NGUOI_KY) LIKE sT
                            OR LOWER(hd_temp.SHCC) LIKE sT
                            OR LOWER(TRIM(benA.HO || ' ' || benA.TEN)) LIKE sT
                            OR LOWER(TRIM(nguoiKy.HO || ' ' || nguoiKy.TEN)) LIKE sT
                            OR LOWER(hd_temp.SO_HOP_DONG) LIKE sT)
                        )                  AS                   "danhSachHd",

                        ROW_NUMBER() OVER (ORDER BY hd.NGAY_KY_HOP_DONG, benA.TEN DESC) R
                 FROM (SELECT *
                       FROM QT_HOP_DONG_DON_VI_TRA_LUONG
                       WHERE ID IN
                             (SELECT MAX(ID)
                              FROM (SELECT * FROM QT_HOP_DONG_DON_VI_TRA_LUONG ORDER BY ID DESC)
                              GROUP BY SHCC)) hd
                          LEFT JOIN TCHC_CAN_BO benA on hd.SHCC = benA.SHCC
                          LEFT JOIN TCHC_CAN_BO nguoiKy on hd.NGUOI_KY = nguoiKy.SHCC
                 ORDER BY hd.NGAY_KY_HOP_DONG DESC, benA.TEN DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION TC_HOC_PHI_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                       searchTerm IN STRING, filter IN STRING,
                                       totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(502) := '%' || lower(searchTerm) || '%';
    namHoc    NUMBER(4);
    hocKy     NUMBER(1);
BEGIN
    SELECT JSON_VALUE(filter, '$.namHoc') INTO namHoc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.hocKy') INTO hocKy FROM DUAL;

    SELECT COUNT(*)
    INTO totalItem
    FROM TC_HOC_PHI HP
             LEFT JOIN FW_STUDENT FS on HP.MSSV = FS.MSSV
    WHERE (NAM_HOC = namHoc AND HOC_KY = hocKy)
      AND (searchTerm = ''
        OR LOWER(TRIM(FS.HO || ' ' || FS.TEN)) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT HP.MSSV                  AS         "mssv",
                     HP.NAM_HOC               AS         "namHoc",
                     HP.HOC_KY                AS         "hocKy",
                     HP.CONG_NO               AS         "congNo",
                     HP.HOC_PHI               AS         "hocPhi",
                     (FS.HO || ' ' || FS.TEN) AS         "hoTenSinhVien",
                     ROW_NUMBER() OVER (ORDER BY FS.TEN) R
              FROM TC_HOC_PHI HP
                       LEFT JOIN FW_STUDENT FS on HP.MSSV = FS.MSSV
              WHERE (NAM_HOC = namHoc AND HOC_KY = hocKy)
                AND (searchTerm = ''
                  OR LOWER(TRIM(FS.HO || ' ' || FS.TEN)) LIKE sT))
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END ;

/
--EndMethod--

